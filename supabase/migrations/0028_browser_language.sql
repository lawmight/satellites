-- 0028: each tab's browser language, and the share of its tabs that searched, so the owner can see how many visitors'
-- browsers ask for a language the site does not speak and whether they leave without searching (what English costs,
-- language by language); and the app's four new languages (Russian, Vietnamese, Persian, Hindi; owner, 2026-11-21).
--
-- The four languages: log_events' list of the app's locales takes them, so a tab shown in one of them records its
-- language (0027 stored null for a code it did not know), and admin_stats_compute lists all 20 of session.lang (0027
-- kept 16).
--
-- The browser's language is a fact about the tab, like its device, so it is kept and counted as 0027 keeps the tab's
-- language, with no new request and no new event (every batch already carries `ctx`):
--   * event_sessions gets a `browser_lang` column. log_events takes it from the batch's ctx.browser_lang: the primary
--     language subtag of the browser's first language (navigator.languages[0]: 'hi' for hi-IN, 'zh' for zh-TW), two or
--     three lowercase letters. Any language, not only the app's 20: the point is the ones it lacks. Anything else is
--     none. The first batch that names one writes it, and it stays (the app reads it once a tab, src/lib/telemetry.ts);
--     a row from before this migration takes it from its next batch. Not indexed, so the batch's update stays HOT (0017).
--   * event_aggregates and event_hour_aggregates add two breakdowns next to session.lang: `session.browser_lang`, tabs
--     by browser language, and `session.browser_lang_searched`, those of them that searched (the funnel's Searched stage,
--     by browser language). Both count a tab once an Eastern day (0019): in the hourly rollups, in the first when the
--     tab's first hour that day is rolled and in the second when the first hour it searched in that day is (the stage
--     bits of event_tab_days), so a day's hours add up to its distinct tabs. Per language, searched / tabs is the share
--     of its tabs that searched. Tabs with no browser language (an app from before this, a row from before this
--     migration) are in neither, as tabs with no language are not in session.lang. Every rollup after them carries the
--     two like the others: top 200 values an hour and a day (event_keep), more than browsers send in practice.
--   * admin_stats_compute lists 200 values of each (in practice all: the page marks the languages the site does not
--     speak and adds their rows up) and all 20 of session.lang. Nothing else in it changes.
-- Nothing is backfilled: no browser language was recorded before. The client may deploy before or after this:
-- log_events ignores a ctx key it does not know, and the page says "No browser languages recorded yet" until the list
-- has rows.
--
-- The one table change is `add column` with no default on event_sessions, as in 0027: no rewrite, but it needs the
-- table to itself for a moment, and every log_events call reads and writes it. Apply clear of :00 and :17 (the stats
-- refresh and the hourly rollup read it); lock_timeout makes the migration give up rather than keep log_events calls
-- waiting past their own 3 s statement timeout (run it again a few minutes later). Its test keeps the table for the
-- whole run, so it computes no stats: see its header.
-- Needs 0027 (its lang column). Idempotent: add column if not exists, create or replace of this project's functions.

set local lock_timeout = '2s';

-- Nullable, no default: null is "not recorded" (a tab from before this, or one whose app sent no browser language).
alter table public.event_sessions add column if not exists browser_lang text;

-- ── log_events ──────────────────────────────────────────────────────────────────────────────
-- 0027's, with ru, vi, fa and hi, keeping the tab's browser language.

create or replace function public.log_events(batch jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sid    text;
  v_ctx    jsonb;
  v_events jsonb;
  v_n      int;
  v_ses    public.event_sessions;
  v_known  boolean;
  v_room   int;
  v_ref    text;
  ev       jsonb;
  v_type   text[] := '{}';
  v_props  jsonb[] := '{}';
  v_dts    bigint[] := '{}';
  v_p      jsonb;
  v_take   int;
  i        int;
  v_minute timestamptz := date_trunc('minute', now());
  v_recent numeric;
  v_searches int := 0;
  v_shares int := 0;
  v_tabs   int := 0;
  v_active int := 0;
  v_lapses int := 0;
  -- The app's languages (0027; 0028 adds ru, vi, fa, hi), exactly api/_lib/i18n/locales.ts LOCALES.
  v_langs  constant text[] := array['en', 'es', 'fr', 'de', 'pt-BR', 'it', 'nl', 'pl', 'tr', 'id', 'uk', 'ja', 'ko',
                                    'zh-Hans', 'zh-Hant', 'ar', 'ru', 'vi', 'fa', 'hi'];
  v_lang   text;
  v_blang  text;
begin
  if batch is null or jsonb_typeof(batch) is distinct from 'object' or octet_length(batch::text) > 16384 then
    raise exception 'invalid batch' using errcode = '22023';
  end if;
  v_sid := batch ->> 'sid';
  if jsonb_typeof(batch -> 'sid') is distinct from 'string' or v_sid !~ '^[A-Za-z0-9_-]{16,32}$' then
    raise exception 'invalid session' using errcode = '22023';
  end if;
  v_events := batch -> 'events';
  if jsonb_typeof(v_events) is distinct from 'array' then raise exception 'invalid events' using errcode = '22023'; end if;
  v_n := jsonb_array_length(v_events);
  if v_n = 0 then return; end if;
  if v_n > 50 then raise exception 'too many events' using errcode = '22023'; end if;

  -- Limits, before any per-event work (0020: constant cost, whatever the traffic): 2000 events per tab overall; 120 a
  -- minute per tab, on average since its first batch (and 120 in its first minute); 6000 events + new tabs a minute
  -- overall, over a sliding minute of the event_rate counters.
  select * into v_ses from public.event_sessions where sid = v_sid;
  v_known := found;
  if v_known and v_ses.n >= 2000 then return; end if;
  v_room := 2000 - coalesce(v_ses.n, 0);
  if v_known then
    v_room := least(v_room, (120 * (1 + floor(extract(epoch from now() - v_ses.first_at) / 60)))::int - v_ses.n);
  end if;
  if v_room <= 0 then return; end if;
  select coalesce(sum(r.n) filter (where r.minute = v_minute), 0)
         + coalesce(sum(r.n) filter (where r.minute = v_minute - interval '1 minute'), 0)
           * (1 - extract(epoch from now() - v_minute) / 60)
    into v_recent
  from overflight_private.event_rate r where r.minute >= v_minute - interval '1 minute';
  if v_recent >= 6000 then return; end if;

  v_ctx := case when jsonb_typeof(batch -> 'ctx') = 'object' then batch -> 'ctx' else '{}'::jsonb end;
  -- The language the app was showing when the batch was sent (0027): one of its locales, else none.
  v_lang := overflight_private.jenum(v_ctx, 'lang', v_langs);
  -- The browser's first language (0028): its primary subtag, any language, else none.
  v_blang := overflight_private.jmatch(v_ctx, 'browser_lang', '^[a-z]{2,3}$', 3);
  for ev in select value from jsonb_array_elements(v_events) loop
    exit when cardinality(v_type) >= v_room;
    continue when jsonb_typeof(ev) is distinct from 'object' or jsonb_typeof(ev -> 'type') is distinct from 'string';
    v_p := overflight_private.event_props(ev ->> 'type', ev -> 'p');
    continue when v_p is null;
    v_type := array_append(v_type, ev ->> 'type');
    if ev ->> 'type' = 'search' then v_searches := v_searches + 1;
    elsif ev ->> 'type' = 'share_action' then v_shares := v_shares + 1;
    elsif ev ->> 'type' = 'timelapse_open' then v_lapses := v_lapses + 1; end if;
    v_props := array_append(v_props, v_p);
    v_dts := array_append(v_dts, coalesce(overflight_private.jint(ev, 'dt', 0, 600000), 0));
  end loop;
  v_take := cardinality(v_type);
  if v_take = 0 then return; end if; -- nothing acceptable: no tab row either

  if not v_known then
    v_ref := lower(v_ctx ->> 'ref');
    if jsonb_typeof(v_ctx -> 'ref') is distinct from 'string' or char_length(v_ref) > 100 or v_ref !~ '^([a-z0-9-]+\.)+[a-z]{2,}$' then
      v_ref := null;
    end if;
    insert into public.event_sessions (sid, device, country, ref_host, utm, app_version, lang, browser_lang)
    values (
      v_sid,
      overflight_private.jenum(v_ctx, 'device', array['phone', 'tablet', 'desktop']),
      overflight_private.jmatch(v_ctx, 'country', '^[a-z]{2}$', 2),
      v_ref,
      nullif(concat_ws(' / ',
        overflight_private.clean_masked(v_ctx ->> 'utm_source', 40),
        overflight_private.clean_masked(v_ctx ->> 'utm_medium', 40),
        overflight_private.clean_masked(v_ctx ->> 'utm_campaign', 60)), ''),
      overflight_private.jmatch(v_ctx, 'v', '^([0-9a-f]{7}|\d{1,4}\.\d{1,4}\.\d{1,4}|dev)$', 24),
      v_lang,
      v_blang)
    on conflict (sid) do nothing;
    get diagnostics v_tabs = row_count;  -- 0 when another batch of this tab made the row first
    v_active := v_tabs;
  else
    if (v_ses.last_at at time zone overflight_private.admin_tz())::date < (now() at time zone overflight_private.admin_tz())::date then
      v_tabs := 1;  -- a tab counts once a day (0019): its first batch of this Eastern day
    end if;
    if v_ses.last_at < date_trunc('hour', now()) then
      v_active := 1;  -- and once an hour in the hourly chart (event_hours.active): its first batch of this hour
    end if;
  end if;

  for i in 1 .. v_take loop
    insert into public.events (created_at, sid, type, props)
    values (now() - make_interval(secs => v_dts[i] / 1000.0), v_sid, v_type[i], v_props[i]);
  end loop;

  -- A batch that names a language replaces the tab's (a switch in the language menu); one that names none keeps it.
  -- The browser's language stays as the tab's first batch to name one gave it (a row from before 0028 takes its next).
  update public.event_sessions set last_at = now(), n = n + v_take, lang = coalesce(v_lang, lang),
    browser_lang = coalesce(browser_lang, v_blang) where sid = v_sid;

  -- Count them (and a new tab) for the overall limit. 16 rows a minute, by tab, so concurrent batches rarely wait on
  -- the same row. The same row counts the batch's searches, shares and tabs for admin_live (0023), the tabs active
  -- this hour (0025) and the time-lapse opens (0026). A row an earlier log_events made has nulls there, and stays
  -- null: that minute was not counted in full.
  insert into overflight_private.event_rate as r (minute, shard, n, searches, shares, tabs, active, timelapses)
  values (v_minute, hashtext(v_sid) & 15, v_take + case when v_known then 0 else 1 end, v_searches, v_shares, v_tabs, v_active,
          v_lapses)
  on conflict (minute, shard) do update set n = r.n + excluded.n, searches = r.searches + excluded.searches,
    shares = r.shares + excluded.shares, tabs = r.tabs + excluded.tabs, active = r.active + excluded.active,
    timelapses = r.timelapses + excluded.timelapses;
end
$$;

-- ── Breakdowns (0027's, with session.browser_lang and session.browser_lang_searched) ────────
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
           case when ev.type = 'timelapse_share' then ev.props ->> 'action' end as tl_action
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
           case when ev.type = 'timelapse_share' then ev.props ->> 'action' end as tl_action
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
  union all select nw.day, 'funnel', 'stage', st.stage, count(*)
    from nw join (values (2, 'search'), (4, 'results'), (8, 'pass_open'), (16, 'lightbox_open'), (32, 'share_open'),
                         (64, 'share_action')) as st(bit, stage) on nw.fresh & st.bit <> 0
    group by 1, 4
$$;

-- ── Admin stats (0027's, listing all 20 languages and every browser language) ──────────────
create or replace function overflight_private.admin_stats_compute(p_range text DEFAULT '7d'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
 SET "TimeZone" TO 'UTC'
 SET work_mem TO '16MB'
AS $function$
declare
  v_tz     text := overflight_private.admin_tz();
  v_now    timestamptz := now();
  v_to     timestamptz := date_trunc('hour', now()) + interval '1 hour';
  v_today  date := (now() at time zone overflight_private.admin_tz())::date;
  v_from   timestamptz;  -- where the range starts
  v_day0   date;         -- its first Eastern day
  v_split  timestamptz;  -- the end of the last rolled day
  v_recent timestamptz;  -- event_recent_into from here
  v_hours  timestamptz;  -- the end of the last rolled hour (event_hours)
  v_hourly boolean;
  v_out    jsonb;
  v_bf_search  bigint;
  v_bf_session bigint;
begin
  -- No admin check here: only admin_stats_core (checked), public.admin_stats (checked) and the cron refresh call this.
  if p_range is null or p_range not in ('24h', '7d', '30d', 'all') then p_range := '7d'; end if;
  v_hourly := p_range in ('24h', '7d');
  v_split := coalesce((select (max(day) + 1)::timestamp at time zone v_tz from public.event_rolled), '-infinity'::timestamptz);
  v_hours := coalesce((select max(hour) + interval '1 hour' from public.event_hours), '-infinity'::timestamptz);
  v_from := case p_range
    when '24h' then date_trunc('hour', v_now) - interval '24 hours'
    when '7d'  then (v_today - 6)::timestamp at time zone v_tz
    when '30d' then (v_today - 29)::timestamp at time zone v_tz
    else '-infinity'::timestamptz end;
  v_day0 := case when isfinite(v_from) then (v_from at time zone v_tz)::date else '-infinity'::date end;
  v_recent := case when p_range = '24h' then v_from else v_split end;

  create temp table if not exists _agg (day date, type text, dim text, val text, n bigint) on commit drop;
  create temp table if not exists _rest (type text, dim text, n bigint) on commit drop;
  create temp table if not exists _dist (metric text, v float8, n bigint) on commit drop;
  truncate _agg, _rest, _dist;

  if p_range <> '24h' then
    -- Rolled days: day totals from event_days; breakdowns from event_days (7d, 30d) or the all-time tables (all).
    insert into _agg select d.day, d.type, d.dim, d.val, d.n from public.event_days d
      where d.day >= v_day0 and d.day < (v_split at time zone v_tz)::date and (p_range <> 'all' or d.dim = '');
    if p_range = 'all' then
      insert into _agg select null, a.type, a.dim, a.val, a.n from public.event_alltime a;
      insert into _rest select r.type, r.dim, r.n from public.event_alltime_rest r;
      insert into _dist select x.metric, x.v, x.n from public.event_alltime_dists x;
    else
      insert into _rest select r.type, r.dim, r.n from public.event_days_rest r
        where r.day >= v_day0 and r.day < (v_split at time zone v_tz)::date;
      insert into _dist select x.metric, x.v, x.n from public.event_dists x
        where x.day >= v_day0 and x.day < (v_split at time zone v_tz)::date;
    end if;
  end if;

  -- The rest of the range, once per transaction for each start.
  create temp table if not exists _rkey (from_at timestamptz, to_at timestamptz) on commit drop;
  create temp table if not exists _ragg (day date, type text, dim text, val text, n bigint) on commit drop;
  create temp table if not exists _rrest (day date, type text, dim text, n bigint) on commit drop;
  create temp table if not exists _rdist (day date, metric text, v float8, n bigint) on commit drop;
  if not exists (select 1 from _rkey k where k.from_at = v_recent and k.to_at = v_to) then
    truncate _rkey, _ragg, _rrest, _rdist;
    perform overflight_private.event_recent_into(v_recent, v_to);
    insert into _rkey values (v_recent, v_to);
  end if;
  insert into _agg select t.day, t.type, t.dim, t.val, t.n from _ragg t where t.day >= v_day0;
  insert into _rest select t.type, t.dim, t.n from _rrest t where t.day >= v_day0;
  insert into _dist select t.metric, t.v, t.n from _rdist t where t.day >= v_day0;

  -- 0015: hours whose events never reached the database add their reconstructed searches and tabs to the day totals
  -- (and so to the daily series). The same hours are added to the hourly series below; 'recorded' keeps the counts
  -- without them, for the ratios.
  select coalesce(sum(b.searches), 0), coalesce(sum(b.sessions), 0) into v_bf_search, v_bf_session
  from overflight_private.event_backfill b where b.hour >= v_from;
  insert into _agg
    select (b.hour at time zone v_tz)::date, t.type, '', '', sum(t.n)::bigint
    from overflight_private.event_backfill b
    cross join lateral (values ('search', b.searches), ('session', b.sessions)) t(type, n)
    where b.hour >= v_from and t.n > 0
    group by 1, 2;

  with
  tot as (select type, sum(n)::bigint n from _agg where dim = '' group by type),
  top as (
    select type, dim, val, sum(n)::bigint n, row_number() over (partition by type, dim order by sum(n) desc, val) rk
    from _agg where dim <> '' and type <> 'funnel' group by type, dim, val
  ),
  dimtot as (
    select k, sum(n)::bigint n from (
      select type || '.' || dim k, n from _agg where dim <> '' and type <> 'funnel'
      union all select type || '.' || dim, n from _rest where type <> 'funnel'
    ) x group by k
  ),
  dist as (
    select metric, array_agg(v order by v) vs, array_agg(n order by v) ns
    from (select metric, v, sum(n)::bigint n from _dist group by metric, v) h group by metric
  ),
  buckets as (
    select b from generate_series(v_from, v_now, interval '1 hour') b where v_hourly
    union all
    select d::date::timestamp at time zone v_tz
    from generate_series(coalesce((select min(day) from _agg), v_today), v_today, interval '1 day') d
    where not v_hourly
  ),
  hourly as (
    select u.b, sum(u.s) s, sum(u.sh) sh, sum(u.se) se, sum(u.tl) tl from (
      -- Rolled hours from event_hours, raw events after the last rolled hour.
      select h.hour b, h.searches s, h.shares sh, h.active se, h.timelapse tl from public.event_hours h
      where v_hourly and h.hour >= v_from and h.hour < v_hours
      union all
      select date_trunc('hour', created_at) b, count(*) filter (where type = 'search') s,
             count(*) filter (where type = 'share_action') sh, count(distinct sid) se,
             count(*) filter (where type = 'timelapse_open') tl
      from public.events
      where v_hourly and created_at >= greatest(v_from, v_hours)
      group by 1
      union all
      select f.hour, f.searches, 0, f.active, 0
      from overflight_private.event_backfill f where v_hourly and f.hour >= v_from
    ) u group by u.b
  ),
  daily as (
    select day::timestamp at time zone v_tz b, sum(n) filter (where type = 'search') s,
           sum(n) filter (where type = 'share_action') sh, sum(n) filter (where type = 'session') se,
           sum(n) filter (where type = 'timelapse_open') tl
    from _agg where not v_hourly and dim = '' group by day
  ),
  series as (
    select k.b, coalesce(x.s, 0) s, coalesce(x.sh, 0) sh, coalesce(x.se, 0) se, coalesce(x.tl, 0) tl
    from buckets k
    left join (select * from hourly union all select * from daily) x on x.b = k.b
  )
  select jsonb_build_object(
    'range', p_range,
    'generatedAt', (extract(epoch from v_now) * 1000)::bigint,
    'from', (extract(epoch from case when isfinite(v_from) then v_from
                                     else coalesce((select min(day) from _agg), v_today)::timestamp at time zone v_tz end) * 1000)::bigint,
    'bucket', case when v_hourly then 'hour' else 'day' end,
    'totals', coalesce((select jsonb_object_agg(type, n) from tot), '{}'::jsonb),
    'recorded', jsonb_build_object(
      'search', coalesce((select n from tot where type = 'search'), 0) - v_bf_search,
      'session', coalesce((select n from tot where type = 'session'), 0) - v_bf_session),
    'dimTotals', coalesce((select jsonb_object_agg(k, n) from dimtot), '{}'::jsonb),
    'funnel', coalesce((select jsonb_object_agg(val, s) from (select val, sum(n)::bigint s from _agg where type = 'funnel' group by val) f), '{}'::jsonb),
    'series', coalesce((select jsonb_agg(jsonb_build_array((extract(epoch from b) * 1000)::bigint, s, sh, se, tl) order by b) from series), '[]'::jsonb),
    'top', coalesce((
      select jsonb_object_agg(k, rows) from (
        select type || '.' || dim k, jsonb_agg(jsonb_build_array(val, n) order by rk) rows
        from top where rk <= case when dim = 'cell' then 3000 when type = 'session' and dim = 'lang' then 20
                                  when type = 'session' and dim in ('browser_lang', 'browser_lang_searched') then 200
                                  else 15 end group by type, dim
      ) t), '{}'::jsonb),
    'results', jsonb_build_object(
        'n', coalesce((select n from tot where type = 'results'), 0),
        'p50Ms', (select overflight_private.hist_pct(vs, ns, 0.5) from dist where metric = 'results.ms'),
        'p90Ms', (select overflight_private.hist_pct(vs, ns, 0.9) from dist where metric = 'results.ms'),
        'partial', coalesce((select sum(n) from _dist where metric = 'results.partial' and v = 1), 0),
        'archiveFailed', coalesce((select sum(n) from _dist where metric = 'results.archive_failed' and v = 1), 0)),
    'vitals', jsonb_build_object(
        'n', coalesce((select n from tot where type = 'vitals'), 0),
        'lcp', (select overflight_private.hist_pct(vs, ns, 0.75) from dist where metric = 'vitals.lcp'),
        'inp', (select overflight_private.hist_pct(vs, ns, 0.75) from dist where metric = 'vitals.inp'),
        'cls', (select overflight_private.hist_pct(vs, ns, 0.75) from dist where metric = 'vitals.cls')),
    'recentSearches', coalesce((
      select jsonb_agg(jsonb_build_object('t', (extract(epoch from r.created_at) * 1000)::bigint, 'label', r.props ->> 'label',
               'country', r.props ->> 'country', 'source', r.props ->> 'source', 'cell', r.props ->> 'cell', 'device', s.device) order by r.created_at desc, r.id desc)
      from (select * from public.events where type = 'search' and created_at >= v_from order by created_at desc, id desc limit 40) r
      left join public.event_sessions s on s.sid = r.sid), '[]'::jsonb),
    'recentErrors', coalesce((
      select jsonb_agg(jsonb_build_object('t', (extract(epoch from r.created_at) * 1000)::bigint, 'where', r.props ->> 'where', 'msg', r.props ->> 'msg') order by r.created_at desc, r.id desc)
      from (select * from public.events where type = 'error' and created_at >= v_from order by created_at desc, id desc limit 30) r), '[]'::jsonb)
  ) into v_out;
  return v_out;
end
$function$;


-- ── Grants (unchanged surface) ──────────────────────────────────────────────────────────────

revoke all on all functions in schema overflight_private from public, anon, authenticated;
revoke all on function public.log_events(jsonb) from public, anon, authenticated;
grant execute on function public.log_events(jsonb) to anon, authenticated;
