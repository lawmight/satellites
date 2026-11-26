-- 0029: one new event, for the maker's Buy Me a Coffee link, so the owner can see which of its places brings people
-- to it (owner, 2026-11-23).
--
--   support_click  { from: 'bar' | 'share' | 'results' | 'about' | 'timelapse' | 'landing' }   the link was pressed
--     bar        the results' bar, from a browser's third result on (src/ui/results/Colophon.tsx ColophonBar)
--     share      the share sheet's foot (ColophonLine)
--     results    the row that closes the results overview (Colophon)
--     about      About's Support credit
--     timelapse  the time-lapse, while its video is made and saved
--     landing    the landing, for a browser that has had results before
--
-- * event_props (0022's, with support_click): anything else in its props is dropped, and one with no known `from` is
--   not recorded. Until this is applied the client's event is simply not recorded (event_props answers null for a type
--   it does not know); nothing else is affected.
-- * event_aggregates and event_hour_aggregates (0028's, with one breakdown more): `support_click.from`, presses by
--   place. The admin page's totals count the type already (every rollup counts every type), and `top` / `dimTotals`
--   list any breakdown there is (admin_stats_compute is unchanged). Each hour and day keeps its top 200 values
--   (event_keep), far more than its six.
-- Nothing is backfilled and no table changes. Apply clear of :00 and :17 (the stats refresh and the hourly rollup call
-- these functions). Idempotent: create or replace of this project's functions.

-- ── event_props (0022's, with support_click) ─────────────────────────────────────────────────
create or replace function overflight_private.event_props(p_type text, p jsonb)
returns jsonb
language plpgsql immutable
set search_path = public
as $$
declare
  verdicts constant text[] := array['imaged', 'likely', 'could', 'overhead'];
  coll_re  constant text := '^[a-z0-9-]{1,40}$';
  share_from constant text[] := array['headline', 'hero', 'viewer', 'pass'];
  v jsonb;
begin
  if p is null or jsonb_typeof(p) <> 'object' then p := '{}'::jsonb; end if;
  case p_type
    when 'view' then
      v := jsonb_build_object('entry', overflight_private.jenum(p, 'entry', array['landing', 'deep_link', 'share_link']));
    when 'search' then
      v := jsonb_build_object(
        'source',  overflight_private.jenum(p, 'source', array['search', 'example', 'surprise', 'near_me', 'pin', 'deep_link', 'share_link', 'retry']),
        'label',   overflight_private.clean_label(p ->> 'label'),
        'cell',    overflight_private.clean_cell(p ->> 'cell'),
        'country', overflight_private.jmatch(p, 'country', '^[a-z]{2}$', 2));
    when 'results', 'results_final' then
      v := jsonb_build_object(
        'sats',           overflight_private.jint(p, 'sats', 0, 100000),
        'photos',         overflight_private.jint(p, 'photos', 0, 100000),
        'passes',         overflight_private.jint(p, 'passes', 0, 1000000),
        'ms',             overflight_private.jint(p, 'ms', 0, 600000),
        'partial',        overflight_private.jbool(p, 'partial'),
        'archive_failed', overflight_private.jbool(p, 'archive_failed'));
    when 'pass_open', 'lightbox_open', 'share_open', 'share_action' then
      v := jsonb_build_object(
        'norad',      overflight_private.jint(p, 'norad', 1, 999999),
        'sat',        overflight_private.clean_masked(p ->> 'sat', 60),
        'verdict',    overflight_private.jenum(p, 'verdict', verdicts),
        'collection', overflight_private.jmatch(p, 'collection', coll_re, 40));
      if p_type = 'share_open' then
        v := v || jsonb_build_object(
          'kind', overflight_private.jenum(p, 'kind', array['pass', 'summary']),
          'from', overflight_private.jenum(p, 'from', share_from));
      elsif p_type = 'share_action' then
        v := v || jsonb_build_object(
          'action', overflight_private.jenum(p, 'action', array['x', 'copy_link', 'copy_image', 'save_png', 'native']),
          'from',   overflight_private.jenum(p, 'from', share_from));
        if v ->> 'action' is null then return null; end if;
      end if;
    when 'about_open' then
      v := '{}'::jsonb;
    when 'timelapse_open' then
      v := jsonb_build_object('from', overflight_private.jenum(p, 'from', array['results', 'viewer', 'link']));
    when 'timelapse_share' then
      v := jsonb_build_object('action', overflight_private.jenum(p, 'action', array['link', 'video']));
      if v ->> 'action' is null then return null; end if;
    when 'support_click' then
      v := jsonb_build_object('from', overflight_private.jenum(p, 'from', array['bar', 'share', 'results', 'about', 'timelapse', 'landing']));
      if v ->> 'from' is null then return null; end if;
    when 'error' then
      v := jsonb_build_object(
        'where', overflight_private.jenum(p, 'where', array['phase', 'window', 'promise']),
        'msg',   overflight_private.clean_msg(p ->> 'msg'));
      if v ->> 'msg' is null then return null; end if;
    when 'vitals' then
      v := jsonb_build_object(
        'lcp', overflight_private.jint(p, 'lcp', 0, 120000),
        'fcp', overflight_private.jint(p, 'fcp', 0, 120000),
        'inp', overflight_private.jint(p, 'inp', 0, 60000),
        'cls', round(overflight_private.num_in(p, 'cls', 0, 100), 4));
    else
      return null;
  end case;
  return jsonb_strip_nulls(v);
end
$$;

revoke all on function overflight_private.event_props(text, jsonb) from public, anon, authenticated;

-- ── Breakdowns (0028's, with support_click.from) ───────────────────────────────────────────
create or replace function overflight_private.event_aggregates(p_from timestamp with time zone, p_to timestamp with time zone)
 returns table(day date, type text, dim text, val text, n bigint)
 language sql
 stable
 set search_path to 'public'
as $function$
  with e as materialized (
    select (ev.created_at at time zone overflight_private.admin_tz())::date as day, ev.type, ev.sid,
           ev.type = 'search' and ev.props ? 'label'   as has_label,   case when ev.type = 'search' then ev.props ->> 'label' end   as label,
           ev.type = 'search' and ev.props ? 'country' as has_country, case when ev.type = 'search' then ev.props ->> 'country' end as s_country,
           ev.type = 'search' and ev.props ? 'source'  as has_source,  case when ev.type = 'search' then ev.props ->> 'source' end  as source,
           ev.type = 'search' and ev.props ? 'cell'    as has_cell,    case when ev.type = 'search' then ev.props ->> 'cell' end    as cell,
           ev.type in ('pass_open', 'share_action') and (ev.props ? 'sat' or ev.props ? 'norad') as has_sat,
           case when ev.type in ('pass_open', 'share_action') then coalesce(ev.props ->> 'sat', 'NORAD ' || (ev.props ->> 'norad')) end as sat,
           ev.type = 'pass_open' and ev.props ? 'verdict' as has_verdict, case when ev.type = 'pass_open' then ev.props ->> 'verdict' end as verdict,
           case when ev.type = 'share_action' then ev.props ->> 'action' end as action,
           case when ev.type = 'timelapse_open' then ev.props ->> 'from' end as tl_from,
           case when ev.type = 'timelapse_share' then ev.props ->> 'action' end as tl_action,
           case when ev.type = 'support_click' then ev.props ->> 'from' end as sc_from
    from public.events ev
    where ev.created_at >= p_from and ev.created_at < p_to
  ),
  ses as materialized (
    select d.day, d.sid, d.searched, coalesce(s.device, '') as device, coalesce(s.country, '') as country,
           coalesce(s.ref_host, '') as ref_host, coalesce(s.utm, '') as utm, coalesce(s.lang, '') as lang,
           coalesce(s.browser_lang, '') as browser_lang
    from (select e.day, e.sid, bool_or(e.type = 'search') as searched from e group by 1, 2) d
    left join public.event_sessions s on s.sid = d.sid
  )
  select e.day, e.type, '', '', count(*) from e group by 1, 2
  union all select ses.day, 'session', '', '', count(*) from ses group by 1
  union all select ses.day, 'session', 'device', ses.device, count(*) from ses group by 1, 4
  union all select ses.day, 'session', 'country', ses.country, count(*) from ses group by 1, 4
  union all select ses.day, 'session', 'ref', ses.ref_host, count(*) from ses where ses.ref_host <> '' group by 1, 4
  union all select ses.day, 'session', 'utm', ses.utm, count(*) from ses where ses.utm <> '' group by 1, 4
  union all select ses.day, 'session', 'lang', ses.lang, count(*) from ses where ses.lang <> '' group by 1, 4
  union all select ses.day, 'session', 'browser_lang', ses.browser_lang, count(*) from ses where ses.browser_lang <> '' group by 1, 4
  union all select ses.day, 'session', 'browser_lang_searched', ses.browser_lang, count(*) from ses
    where ses.searched and ses.browser_lang <> '' group by 1, 4
  union all select e.day, 'search', 'label', e.label, count(*) from e where e.has_label group by 1, 4
  union all select e.day, 'search', 'country', e.s_country, count(*) from e where e.has_country group by 1, 4
  union all select e.day, 'search', 'source', e.source, count(*) from e where e.has_source group by 1, 4
  union all select e.day, 'search', 'cell', e.cell, count(*) from e where e.has_cell group by 1, 4
  union all select e.day, e.type, 'sat', e.sat, count(*) from e where e.has_sat group by 1, 2, 4
  union all select e.day, 'pass_open', 'verdict', e.verdict, count(*) from e where e.has_verdict group by 1, 4
  union all select e.day, 'share_action', 'action', e.action, count(*) from e where e.type = 'share_action' group by 1, 4
  union all select e.day, 'timelapse_open', 'from', e.tl_from, count(*) from e where e.tl_from is not null group by 1, 4
  union all select e.day, 'timelapse_share', 'action', e.tl_action, count(*) from e where e.tl_action is not null group by 1, 4
  union all select e.day, 'support_click', 'from', e.sc_from, count(*) from e where e.sc_from is not null group by 1, 4
  union all select e.day, 'funnel', 'stage', e.type, count(distinct e.sid)
    from e where e.type in ('search', 'results', 'pass_open', 'lightbox_open', 'share_open', 'share_action') group by 1, 4
$function$;

create or replace function overflight_private.event_hour_aggregates(p_from timestamptz, p_to timestamptz)
returns table (day date, type text, dim text, val text, n bigint)
language sql
stable
set search_path = public
as $$
  with e as materialized (
    select (ev.created_at at time zone overflight_private.admin_tz())::date as day, ev.type, ev.sid,
           ev.type = 'search' and ev.props ? 'label'   as has_label,   case when ev.type = 'search' then ev.props ->> 'label' end   as label,
           ev.type = 'search' and ev.props ? 'country' as has_country, case when ev.type = 'search' then ev.props ->> 'country' end as s_country,
           ev.type = 'search' and ev.props ? 'source'  as has_source,  case when ev.type = 'search' then ev.props ->> 'source' end  as source,
           ev.type = 'search' and ev.props ? 'cell'    as has_cell,    case when ev.type = 'search' then ev.props ->> 'cell' end    as cell,
           ev.type in ('pass_open', 'share_action') and (ev.props ? 'sat' or ev.props ? 'norad') as has_sat,
           case when ev.type in ('pass_open', 'share_action') then coalesce(ev.props ->> 'sat', 'NORAD ' || (ev.props ->> 'norad')) end as sat,
           ev.type = 'pass_open' and ev.props ? 'verdict' as has_verdict, case when ev.type = 'pass_open' then ev.props ->> 'verdict' end as verdict,
           case when ev.type = 'share_action' then ev.props ->> 'action' end as action,
           case when ev.type = 'timelapse_open' then ev.props ->> 'from' end as tl_from,
           case when ev.type = 'timelapse_share' then ev.props ->> 'action' end as tl_action,
           case when ev.type = 'support_click' then ev.props ->> 'from' end as sc_from
    from public.events ev
    where ev.created_at >= p_from and ev.created_at < p_to
  ),
  t as (select e.day, e.sid, bit_or(overflight_private.event_stage_bit(e.type)) as bits from e group by 1, 2),
  nw as materialized (
    select t.day, t.sid, t.bits & ~coalesce(case when d.day = t.day then d.stages end, 0) as fresh
    from t left join public.event_tab_days d on d.sid = t.sid
  ),
  -- The tabs this window counts on their day: new that day (bit 1, every session breakdown) or searching for the first
  -- time that day (bit 2, browser_lang_searched), with their row's facts. ses: the first kind, 0027's ses.
  tabs as materialized (
    select nw.day, nw.fresh, coalesce(s.device, '') as device, coalesce(s.country, '') as country,
           coalesce(s.ref_host, '') as ref_host, coalesce(s.utm, '') as utm, coalesce(s.lang, '') as lang,
           coalesce(s.browser_lang, '') as browser_lang
    from nw left join public.event_sessions s on s.sid = nw.sid
    where nw.fresh & 3 <> 0
  ),
  ses as (select * from tabs where tabs.fresh & 1 = 1)
  select e.day, e.type, '', '', count(*) from e group by 1, 2
  union all select ses.day, 'session', '', '', count(*) from ses group by 1
  union all select ses.day, 'session', 'device', ses.device, count(*) from ses group by 1, 4
  union all select ses.day, 'session', 'country', ses.country, count(*) from ses group by 1, 4
  union all select ses.day, 'session', 'ref', ses.ref_host, count(*) from ses where ses.ref_host <> '' group by 1, 4
  union all select ses.day, 'session', 'utm', ses.utm, count(*) from ses where ses.utm <> '' group by 1, 4
  union all select ses.day, 'session', 'lang', ses.lang, count(*) from ses where ses.lang <> '' group by 1, 4
  union all select ses.day, 'session', 'browser_lang', ses.browser_lang, count(*) from ses where ses.browser_lang <> '' group by 1, 4
  union all select tabs.day, 'session', 'browser_lang_searched', tabs.browser_lang, count(*) from tabs
    where tabs.fresh & 2 <> 0 and tabs.browser_lang <> '' group by 1, 4
  union all select e.day, 'search', 'label', e.label, count(*) from e where e.has_label group by 1, 4
  union all select e.day, 'search', 'country', e.s_country, count(*) from e where e.has_country group by 1, 4
  union all select e.day, 'search', 'source', e.source, count(*) from e where e.has_source group by 1, 4
  union all select e.day, 'search', 'cell', e.cell, count(*) from e where e.has_cell group by 1, 4
  union all select e.day, e.type, 'sat', e.sat, count(*) from e where e.has_sat group by 1, 2, 4
  union all select e.day, 'pass_open', 'verdict', e.verdict, count(*) from e where e.has_verdict group by 1, 4
  union all select e.day, 'share_action', 'action', e.action, count(*) from e where e.type = 'share_action' group by 1, 4
  union all select e.day, 'timelapse_open', 'from', e.tl_from, count(*) from e where e.tl_from is not null group by 1, 4
  union all select e.day, 'timelapse_share', 'action', e.tl_action, count(*) from e where e.tl_action is not null group by 1, 4
  union all select e.day, 'support_click', 'from', e.sc_from, count(*) from e where e.sc_from is not null group by 1, 4
  union all select nw.day, 'funnel', 'stage', st.stage, count(*)
    from nw join (values (2, 'search'), (4, 'results'), (8, 'pass_open'), (16, 'lightbox_open'), (32, 'share_open'),
                         (64, 'share_action')) as st(bit, stage) on nw.fresh & st.bit <> 0
    group by 1, 4
$$;

-- ── Grants (unchanged surface) ──────────────────────────────────────────────────────────────
revoke all on all functions in schema overflight_private from public, anon, authenticated;
