-- Checks for 0027_tab_language.sql. Run as begin; <0027>; <this file>; rollback.  Nothing survives.
-- Row writes only (test tabs, their events, the counter rows log_events adds to), all rolled back; the one table change
-- is 0027's own `add column`.
-- Quick on purpose: that add column keeps event_sessions, which every log_events call needs, until the rollback, so
-- this computes no stats (admin_stats_compute's one change is checked in its text) and reads raw events over two
-- seconds only. Run it once, clear of :00 and :17.

do $$
declare
  v_langs text[] := array['en', 'es', 'fr', 'de', 'pt-BR', 'it', 'nl', 'pl', 'tr', 'id', 'uk', 'ja', 'ko', 'zh-Hans', 'zh-Hant', 'ar'];
  v_sid   text := 'test27_sid_aaaaaaaaaaaaaa';
  v_odd   text := 'test27_odd_aaaaaaaaaaaaaa';
  ev      jsonb := jsonb_build_array(jsonb_build_object('type', 'view', 'p', jsonb_build_object('entry', 'landing')));
  bad     jsonb;
  r       text;
  f       text;
  l       text;
  i       int;
  v_lang  text;
  v_tabs  bigint;
  v_named bigint;
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
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'event_sessions' and column_name = 'lang') then
    raise exception 'event_sessions has no lang column';
  end if;

  -- ── A tab's first batch keeps its language; a later one replaces it only with another of the 16 ──
  perform public.log_events(jsonb_build_object('sid', v_sid, 'ctx', jsonb_build_object('device', 'phone', 'lang', 'de'), 'events', ev));
  select lang into v_lang from public.event_sessions where sid = v_sid;
  if v_lang is distinct from 'de' then raise exception 'first batch: lang %, expected de', v_lang; end if;
  if (select device from public.event_sessions where sid = v_sid) is distinct from 'phone' then raise exception 'first batch: the device was lost'; end if;
  perform public.log_events(jsonb_build_object('sid', v_sid, 'ctx', jsonb_build_object('device', 'phone', 'lang', 'pt-BR'), 'events', ev));
  select lang into v_lang from public.event_sessions where sid = v_sid;
  if v_lang is distinct from 'pt-BR' then raise exception 'a switch: lang %, expected pt-BR', v_lang; end if;
  foreach bad in array array['{"lang": "pt-br"}', '{"lang": "ru"}', '{"lang": "en-US"}', '{"lang": ""}', '{"lang": 5}',
                             '{"lang": ["de"]}', '{"device": "phone"}', '{}']::jsonb[] loop
    perform public.log_events(jsonb_build_object('sid', v_sid, 'ctx', bad, 'events', ev));
    select lang into v_lang from public.event_sessions where sid = v_sid;
    if v_lang is distinct from 'pt-BR' then raise exception 'ctx %: lang became %', bad, v_lang; end if;
  end loop;
  perform public.log_events(jsonb_build_object('sid', v_sid, 'events', ev));  -- no ctx at all
  if (select lang from public.event_sessions where sid = v_sid) is distinct from 'pt-BR' then raise exception 'no ctx: lang changed'; end if;
  if (select n from public.event_sessions where sid = v_sid) <> 11 or (select count(*) from public.events where sid = v_sid) <> 11 then
    raise exception 'not every batch was stored';
  end if;

  -- A first batch with a language the app does not speak: the tab, with none.
  perform public.log_events(jsonb_build_object('sid', v_odd, 'ctx', jsonb_build_object('lang', 'xx'), 'events', ev));
  if not exists (select 1 from public.event_sessions where sid = v_odd and lang is null) then raise exception 'an unknown language was kept'; end if;

  -- Each of the 16, as a first batch.
  for i in 1 .. 16 loop
    perform public.log_events(jsonb_build_object('sid', format('test27_lang_%s_aaaaaaaa', lpad(i::text, 2, '0')),
      'ctx', jsonb_build_object('lang', v_langs[i]), 'events', ev));
    select lang into v_lang from public.event_sessions where sid = format('test27_lang_%s_aaaaaaaa', lpad(i::text, 2, '0'));
    if v_lang is distinct from v_langs[i] then raise exception 'locale %: stored as %', v_langs[i], v_lang; end if;
  end loop;

  -- ── Both aggregate functions count each tab once in its language, and leave out the tab with none ──
  create temp table if not exists _t27 (day date, type text, dim text, val text, n bigint) on commit drop;
  foreach f in array array['event_aggregates', 'event_hour_aggregates'] loop
    truncate _t27;
    execute format('insert into _t27 select * from overflight_private.%I(now() - interval ''1 second'', now() + interval ''1 second'')', f);
    foreach l in array v_langs loop
      if (select coalesce(sum(n), 0) from _t27 where type = 'session' and dim = 'lang' and val = l) < (case l when 'pt-BR' then 2 else 1 end) then
        raise exception '%: session.lang % is missing a tab', f, l;
      end if;
    end loop;
    if (select coalesce(sum(n), 0) from _t27 where type = 'session' and dim = 'lang' and val = 'de') > 1 then
      raise exception '%: the tab that switched from de still counts there', f;
    end if;
    if exists (select 1 from _t27 where type = 'session' and dim = 'lang' and (val is null or val = '' or not val = any(v_langs))) then
      raise exception '%: a row for no language, or not one of the 16', f;
    end if;
    select coalesce(sum(n) filter (where dim = ''), 0), coalesce(sum(n) filter (where dim = 'lang'), 0) into v_tabs, v_named
    from _t27 where type = 'session';
    -- (other tabs' events in these two seconds can only add tabs with no language: their rows are older than the column)
    if v_named < 17 or v_named > v_tabs - 1 then raise exception '%: % tabs with a language of %', f, v_named, v_tabs; end if;
    if (select coalesce(sum(n), 0) from _t27 where type = 'session' and dim = 'device' and val = 'phone') < 1
       or (select coalesce(sum(n), 0) from _t27 where type = 'view' and dim = '') < 28 then
      raise exception '%: the other counts changed', f;
    end if;
  end loop;

  -- ── The stats list all 16 (and every other list as before) ──────────────────────────────────
  if pg_get_functiondef('overflight_private.admin_stats_compute(text)'::regprocedure)
     !~ $re$when dim = 'cell' then 3000 when type = 'session' and dim = 'lang' then 16 else 15 end$re$ then
    raise exception 'admin_stats_compute does not list 16 languages';
  end if;

  raise notice '0027 checks passed';
end
$$;
