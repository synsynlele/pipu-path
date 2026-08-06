-- Preserve the enum type through the accept/decline CASE expression.
create or replace function public.respond_stage11_connection_request(
  connection_id_input uuid,
  accept_input boolean
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.builder_connections%rowtype;
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode='P0001'; end if;
  select * into target from public.builder_connections
  where id = connection_id_input and recipient_id = actor and status = 'pending'
  for update;
  if target.id is null then raise exception 'CONNECT_REQUEST_NOT_FOUND' using errcode='P0001'; end if;
  if private.stage11_builder_pair_blocked(target.requester_id, target.recipient_id) then
    raise exception 'CONNECT_BLOCKED' using errcode='P0001';
  end if;
  if accept_input and (
    not private.stage11_builder_connect_eligible(target.requester_id)
    or not private.stage11_builder_connect_eligible(target.recipient_id)
  ) then
    raise exception 'CONNECT_ADULT_REQUIRED' using errcode='P0001';
  end if;
  update public.builder_connections set
    status = case
      when accept_input then 'accepted'::public.builder_connection_status
      else 'declined'::public.builder_connection_status
    end,
    responded_at = now(),
    accepted_at = case when accept_input then now() else null end,
    closed_at = case when accept_input then null else now() end
  where id = target.id;
  return true;
end;
$$;

revoke all on function public.respond_stage11_connection_request(uuid,boolean) from public,anon;
grant execute on function public.respond_stage11_connection_request(uuid,boolean) to authenticated;
