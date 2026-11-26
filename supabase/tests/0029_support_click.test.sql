-- Checks for 0029_support_click.sql. Run as begin; <0029>; <this file>; rollback.  Nothing survives.
-- Pure function calls and catalog reads only: no rows are written, no table is locked, and no events are scanned, so
-- it can run at any time (clear of :00 and :17, when the rollups call the functions it replaces).

do $$
declare
  r   text;
  f   text;
  src text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if has_function_privilege(r, 'overflight_private.event_props(text, jsonb)', 'execute')
       or has_function_privilege(r, 'overflight_private.event_aggregates(timestamptz, timestamptz)', 'execute')
       or has_function_privilege(r, 'overflight_private.event_hour_aggregates(timestamptz, timestamptz)', 'execute') then
      raise exception 'grants: % can call a private events function', r;
    end if;
    if not has_function_privilege(r, 'public.log_events(jsonb)', 'execute') then raise exception 'grants: % cannot call log_events', r; end if;
  end loop;

  -- ── support_click keeps its place alone, and only a known one ───────────────────────────────
  foreach f in array array['bar', 'share', 'results', 'about', 'timelapse', 'landing'] loop
    if overflight_private.event_props('support_click', jsonb_build_object('from', f, 'place', 'Dubai', 'url', 'https://x'))
       is distinct from jsonb_build_object('from', f) then
      raise exception 'event_props: support_click from % is not its from alone', f;
    end if;
  end loop;
  if overflight_private.event_props('support_click', '{"from": "banner"}') is not null
     or overflight_private.event_props('support_click', '{}') is not null
     or overflight_private.event_props('support_click', null) is not null then
    raise exception 'event_props: a support_click without a known from was kept';
  end if;

  -- ── the events 0022 knew are untouched ─────────────────────────────────────────────────────
  if overflight_private.event_props('timelapse_open', '{"from": "viewer", "place": "Dubai"}') is distinct from '{"from": "viewer"}'::jsonb then
    raise exception 'event_props: timelapse_open changed';
  end if;
  if overflight_private.event_props('timelapse_share', '{"action": "gif"}') is not null then raise exception 'event_props: timelapse_share changed'; end if;
  if overflight_private.event_props('share_open', '{"kind": "summary", "from": "headline"}') is distinct from '{"kind": "summary", "from": "headline"}'::jsonb then
    raise exception 'event_props: share_open changed';
  end if;
  if overflight_private.event_props('search', '{"source": "surprise"}') ->> 'source' is distinct from 'surprise' then raise exception 'event_props: search changed'; end if;
  if overflight_private.event_props('about_open', '{}') is distinct from '{}'::jsonb then raise exception 'event_props: about_open changed'; end if;
  if overflight_private.event_props('made_up', '{}') is not null then raise exception 'event_props: an unknown type was kept'; end if;

  -- ── both rollups break support_click down by place, and keep every breakdown 0028 had ───────
  foreach f in array array['event_aggregates', 'event_hour_aggregates'] loop
    select p.prosrc into src from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'overflight_private' and p.proname = f;
    if src is null then raise exception '% is missing', f; end if;
    if position($q$'support_click', 'from', e.sc_from$q$ in src) = 0
       or position($q$when ev.type = 'support_click' then ev.props ->> 'from' end as sc_from$q$ in src) = 0 then
      raise exception '%: no support_click.from breakdown', f;
    end if;
    if position($q$'timelapse_share', 'action', e.tl_action$q$ in src) = 0
       or position($q$'timelapse_open', 'from', e.tl_from$q$ in src) = 0
       or position($q$'session', 'browser_lang_searched'$q$ in src) = 0
       or position($q$'funnel', 'stage'$q$ in src) = 0 then
      raise exception '%: lost a breakdown 0028 had', f;
    end if;
  end loop;
  -- they still run (an empty window: no rows are read)
  perform * from overflight_private.event_aggregates(timestamptz '2020-01-01', timestamptz '2020-01-01');
  perform * from overflight_private.event_hour_aggregates(timestamptz '2020-01-01', timestamptz '2020-01-01');
  raise notice '0029 checks passed';
end
$$;
