-- A backup operator can resume review, but cannot steal an active worker lease.
create or replace function public.take_over_account_deletion_review(request_id_input uuid, operator_id_input uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
  if not exists(select 1 from public.platform_admins where user_id=operator_id_input and status='active' and role in ('owner','operator')) then raise exception 'FORBIDDEN'; end if;
  perform 1 from public.account_deletion_requests where id=request_id_input and status='reviewing' for update;
  if not found then raise exception 'PRIVACY_REVIEW_UNAVAILABLE'; end if;
  if exists(select 1 from public.account_deletion_jobs where request_id=request_id_input and state='processing' and lease_until>now()) then raise exception 'PRIVACY_JOB_BUSY'; end if;
  update public.account_deletion_requests set reviewed_by=operator_id_input,reviewed_at=now() where id=request_id_input;
end; $$;
revoke all on function public.take_over_account_deletion_review(uuid,uuid) from public,anon,authenticated;
grant execute on function public.take_over_account_deletion_review(uuid,uuid) to service_role;
