-- Checks for 0030_support_click_places.sql. Run as begin; <0030>; <this file>; rollback.  Nothing survives.
-- Pure function calls only: no rows are written and no table is touched.

do $$
declare
  r text;
  f text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if has_function_privilege(r, 'overflight_private.event_props(text, jsonb)', 'execute') then
      raise exception 'grants: % can call event_props', r;
    end if;
  end loop;
  -- every place, 0029's six and the new two, keeps its from alone
  foreach f in array array['bar', 'share', 'results', 'about', 'timelapse', 'landing', 'computing', 'about_top'] loop
    if overflight_private.event_props('support_click', jsonb_build_object('from', f, 'place', 'Dubai'))
       is distinct from jsonb_build_object('from', f) then
      raise exception 'event_props: support_click from % is not its from alone', f;
    end if;
  end loop;
  if overflight_private.event_props('support_click', '{"from": "banner"}') is not null
     or overflight_private.event_props('support_click', '{}') is not null then
    raise exception 'event_props: a support_click without a known from was kept';
  end if;
  -- the other events are untouched
  if overflight_private.event_props('timelapse_open', '{"from": "viewer", "place": "Dubai"}') is distinct from '{"from": "viewer"}'::jsonb then
    raise exception 'event_props: timelapse_open changed';
  end if;
  if overflight_private.event_props('share_open', '{"kind": "summary", "from": "headline"}') is distinct from '{"kind": "summary", "from": "headline"}'::jsonb then
    raise exception 'event_props: share_open changed';
  end if;
  if overflight_private.event_props('search', '{"source": "surprise"}') ->> 'source' is distinct from 'surprise' then raise exception 'event_props: search changed'; end if;
  if overflight_private.event_props('about_open', '{}') is distinct from '{}'::jsonb then raise exception 'event_props: about_open changed'; end if;
  if overflight_private.event_props('made_up', '{}') is not null then raise exception 'event_props: an unknown type was kept'; end if;
  raise notice '0030 checks passed';
end
$$;
