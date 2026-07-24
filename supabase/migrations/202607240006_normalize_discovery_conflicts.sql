-- Return optimistic concurrency conflicts as stable application errors.
--
-- Migration 004 used SQLSTATE 40001, which is reserved for database
-- serialization failures. Supabase/PostgREST clients may retry or wait on that
-- code. Keep the already-applied implementation immutable, move it behind
-- private wrappers, and translate only its intentional concurrency conflict to
-- a non-retryable application exception.

alter function public.save_discovery_response(
  uuid, text, text, text[], integer, boolean, integer
) rename to save_discovery_response_v1_internal;

alter function public.open_discovery_review(uuid, integer)
rename to open_discovery_review_v1_internal;

alter function public.complete_discovery(uuid, integer)
rename to complete_discovery_v1_internal;

revoke all on function public.save_discovery_response_v1_internal(
  uuid, text, text, text[], integer, boolean, integer
) from public, anon, authenticated, service_role;
revoke all on function public.open_discovery_review_v1_internal(uuid, integer)
from public, anon, authenticated, service_role;
revoke all on function public.complete_discovery_v1_internal(uuid, integer)
from public, anon, authenticated, service_role;

create function public.save_discovery_response(
  session_id_input uuid,
  question_key_input text,
  text_response_input text,
  selected_options_input text[],
  numeric_response_input integer,
  skip_input boolean,
  expected_version_input integer
) returns integer
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.save_discovery_response_v1_internal(
    session_id_input,
    question_key_input,
    text_response_input,
    selected_options_input,
    numeric_response_input,
    skip_input,
    expected_version_input
  );
exception
  when serialization_failure then
    if sqlerrm = 'DISCOVERY_SAVE_CONFLICT' then
      raise exception 'DISCOVERY_SAVE_CONFLICT' using errcode = 'P0001';
    end if;
    raise;
end;
$$;

create function public.open_discovery_review(
  session_id_input uuid,
  expected_version_input integer
) returns integer
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.open_discovery_review_v1_internal(
    session_id_input,
    expected_version_input
  );
exception
  when serialization_failure then
    if sqlerrm = 'DISCOVERY_SAVE_CONFLICT' then
      raise exception 'DISCOVERY_SAVE_CONFLICT' using errcode = 'P0001';
    end if;
    raise;
end;
$$;

create function public.complete_discovery(
  session_id_input uuid,
  expected_version_input integer
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.complete_discovery_v1_internal(
    session_id_input,
    expected_version_input
  );
exception
  when serialization_failure then
    if sqlerrm = 'DISCOVERY_SAVE_CONFLICT' then
      raise exception 'DISCOVERY_SAVE_CONFLICT' using errcode = 'P0001';
    end if;
    raise;
end;
$$;

revoke all on function public.save_discovery_response(
  uuid, text, text, text[], integer, boolean, integer
) from public, anon, authenticated, service_role;
revoke all on function public.open_discovery_review(uuid, integer)
from public, anon, authenticated, service_role;
revoke all on function public.complete_discovery(uuid, integer)
from public, anon, authenticated, service_role;

grant execute on function public.save_discovery_response(
  uuid, text, text, text[], integer, boolean, integer
) to authenticated;
grant execute on function public.open_discovery_review(uuid, integer)
to authenticated;
grant execute on function public.complete_discovery(uuid, integer)
to authenticated;
