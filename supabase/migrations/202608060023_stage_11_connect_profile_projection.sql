-- Stage 11 follow-up in the same migration batch: owner-safe profile projection.
create or replace function public.get_stage11_own_network_profile()
returns table (
  user_id uuid,
  headline text,
  can_help_with text[],
  needs_help_with text[],
  interests text[],
  is_discoverable boolean,
  consent_version text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode = 'P0001'; end if;
  return query
  select network.user_id, network.headline, network.can_help_with,
    network.needs_help_with, network.interests, network.is_discoverable,
    network.consent_version
  from public.builder_network_profiles network
  where network.user_id = actor;
end $$;
revoke all on function public.get_stage11_own_network_profile() from public, anon;
grant execute on function public.get_stage11_own_network_profile() to authenticated;
