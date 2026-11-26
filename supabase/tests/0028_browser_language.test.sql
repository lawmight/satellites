-- Checks for 0028_browser_language.sql. Run as begin; <0028>; <this file>; rollback.  Nothing survives.
-- Row writes only (test tabs, their events, the counter rows log_events adds to), all rolled back; the one table change
-- is 0028's own `add column`.
-- Quick on purpose, as 0027's: that add column keeps event_sessions, which every log_events call needs, until the
-- rollback, so this computes no stats (admin_stats_compute's one change is checked in its text) and reads raw events
-- over two seconds only. Run it once, clear of :00 and :17.

do $$
declare
  ev      jsonb := jsonb_build_array(jsonb_build_object('type', 'view', 'p', jsonb_build_object('entry', 'landing')));
  srch    jsonb := jsonb_build_array(jsonb_build_object('type', 'search', 'p', jsonb_build_object('source', 'search')));
  bad     jsonb;
  r       text;
  f       text;
  l       text;
  i       int := 0;
  v_bl    text;
  v_n     bigint;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if has_table_privilege(r, 'public.event_sessions', 'select') then raise exception 'grants: % can read event_sessions', r; end if;
    if has_function_privilege(r, 'overflight_private.admin_stats_compute(text)', 'execute')
       or has_function_privilege(r, 'overflight_private.event_aggregates(timestamptz, timestamptz)', 'execute')
       or has_function_privilege(r, 'overflight_private.event_hour_aggregates(timestamptz, timestamptz)', 'execute') then
      raise exception 'grants: % can call a private stats function', r;
    end if;
    if not has_function_privilege(r, 'public.log_events(jsonb)', 'execute') then raise exception 'grants: % cannot call log_events', r; end if;
  end loop;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'event_sessions' and column_name = 'browser_lang') then
    raise exception 'event_sessions has no browser_lang column';
  end if;

  -- ── The four new languages are kept as the tab's language ──────────────────────────────────
  foreach l in array array['ru', 'vi', 'fa', 'hi'] loop
    perform public.log_events(jsonb_build_object('sid', format('test28_lang_%s_aaaaaaaaaa', l), 'ctx', jsonb_build_object('lang', l), 'events', ev));
    if (select lang from public.event_sessions where sid = format('test28_lang_%s_aaaaaaaaaa', l)) is distinct from l then
      raise exception 'locale % was not kept', l;
    end if;
  end loop;

  -- ── The browser's language: the first batch's stays; junk is none ──────────────────────────
  perform public.log_events(jsonb_build_object('sid', 'test28_hi_a_aaaaaaaaaaaaa', 'ctx', jsonb_build_object('lang', 'en', 'browser_lang', 'hi'), 'events', srch));
  perform public.log_events(jsonb_build_object('sid', 'test28_hi_a_aaaaaaaaaaaaa', 'ctx', jsonb_build_object('lang', 'en', 'browser_lang', 'sv'), 'events', ev));
  perform public.log_events(jsonb_build_object('sid', 'test28_hi_a_aaaaaaaaaaaaa', 'ctx', jsonb_build_object('lang', 'en'), 'events', ev));
  select browser_lang into v_bl from public.event_sessions where sid = 'test28_hi_a_aaaaaaaaaaaaa';
  if v_bl is distinct from 'hi' then raise exception 'browser_lang %, expected the first batch''s hi', v_bl; end if;
  if (select (lang, n) from public.event_sessions where sid = 'test28_hi_a_aaaaaaaaaaaaa') is distinct from ('en'::text, 3) then
    raise exception 'the tab''s language or its count changed';
  end if;
  foreach bad in array array['{"browser_lang": "HI"}', '{"browser_lang": "hi-IN"}', '{"browser_lang": "h"}', '{"browser_lang": "hind"}',
                             '{"browser_lang": ""}', '{"browser_lang": 5}', '{"browser_lang": ["hi"]}', '{"browser_lang": "x1"}', '{}']::jsonb[] loop
    i := i + 1;
    perform public.log_events(jsonb_build_object('sid', format('test28_bad_%s_aaaaaaaaaaaa', i), 'ctx', bad, 'events', ev));
    if not exists (select 1 from public.event_sessions where sid = format('test28_bad_%s_aaaaaaaaaaaa', i) and browser_lang is null) then
      raise exception 'ctx % kept a browser language', bad;
    end if;
  end loop;
  -- A tab with none (a row from before 0028, or a batch that named none) takes the next batch's.
  perform public.log_events(jsonb_build_object('sid', 'test28_bad_9_aaaaaaaaaaaa', 'ctx', jsonb_build_object('browser_lang', 'fil'), 'events', ev));
  if (select browser_lang from public.event_sessions where sid = 'test28_bad_9_aaaaaaaaaaaa') is distinct from 'fil' then
    raise exception 'a tab with none did not take the next batch''s';
  end if;

  -- Three more: hi without a search; sv searching twice in two batches; sv searching once.
  perform public.log_events(jsonb_build_object('sid', 'test28_hi_b_aaaaaaaaaaaaa', 'ctx', jsonb_build_object('browser_lang', 'hi'), 'events', ev));
  perform public.log_events(jsonb_build_object('sid', 'test28_sv_a_aaaaaaaaaaaaa', 'ctx', jsonb_build_object('browser_lang', 'sv'), 'events', srch));
  perform public.log_events(jsonb_build_object('sid', 'test28_sv_a_aaaaaaaaaaaaa', 'ctx', jsonb_build_object('browser_lang', 'sv'), 'events', srch || ev));
  perform public.log_events(jsonb_build_object('sid', 'test28_sv_b_aaaaaaaaaaaaa', 'ctx', jsonb_build_object('browser_lang', 'sv'), 'events', ev || srch));

  -- ── Both aggregate functions count each tab once, and each searching tab once ──────────────
  -- Other tabs' events in these two seconds have no browser language (their rows are older than the column, and their
  -- log_events calls wait for the rollback), so the counts are exact.
  create temp table if not exists _t28 (day date, type text, dim text, val text, n bigint) on commit drop;
  foreach f in array array['event_aggregates', 'event_hour_aggregates'] loop
    truncate _t28;
    execute format('insert into _t28 select * from overflight_private.%I(now() - interval ''1 second'', now() + interval ''1 second'')', f);
    if (select coalesce(jsonb_object_agg(val, n), '{}') from _t28 where type = 'session' and dim = 'browser_lang') <> '{"hi": 2, "sv": 2, "fil": 1}' then
      raise exception '%: session.browser_lang %', f, (select jsonb_object_agg(val, n) from _t28 where type = 'session' and dim = 'browser_lang');
    end if;
    if (select coalesce(jsonb_object_agg(val, n), '{}') from _t28 where type = 'session' and dim = 'browser_lang_searched') <> '{"hi": 1, "sv": 2}' then
      raise exception '%: session.browser_lang_searched %', f, (select jsonb_object_agg(val, n) from _t28 where type = 'session' and dim = 'browser_lang_searched');
    end if;
    select coalesce(sum(n), 0) into v_n from _t28 where type = 'funnel' and dim = 'stage' and val = 'search';
    if v_n < 3 then raise exception '%: the funnel lost its searching tabs (%)', f, v_n; end if;
    if (select coalesce(sum(n), 0) from _t28 where type = 'session' and dim = 'lang' and val in ('ru', 'vi', 'fa', 'hi')) < 4
       or (select coalesce(sum(n), 0) from _t28 where type = 'session' and dim = 'lang' and val = 'en') < 1
       or (select coalesce(sum(n), 0) from _t28 where type = 'session' and dim = '') < 17
       or (select coalesce(sum(n), 0) from _t28 where type = 'search' and dim = '') < 4 then
      raise exception '%: the other counts changed', f;
    end if;
  end loop;

  -- ── The stats list all 20 languages and every browser language (and every other list as before) ──
  if pg_get_functiondef('overflight_private.admin_stats_compute(text)'::regprocedure)
     !~ $re$when dim = 'cell' then 3000 when type = 'session' and dim = 'lang' then 20\s+when type = 'session' and dim in \('browser_lang', 'browser_lang_searched'\) then 200\s+else 15 end$re$ then
    raise exception 'admin_stats_compute does not list 20 languages and 200 browser languages';
  end if;

  raise notice '0028 checks passed';
end
$$;
