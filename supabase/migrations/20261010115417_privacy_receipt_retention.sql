-- Approved 10 October: retain minimal verified receipts for 90 days.
-- Never delete pending/failed/processing cases or records still linked to a user.
create index account_deletion_verified_receipt_expiry_idx
  on public.account_deletion_requests(fulfilled_at)
  where status='fulfilled' and user_id is null;

create or replace function private.cleanup_account_deletion_receipts()
returns integer language plpgsql security definer set search_path='' as $$
declare removed integer;
begin
  with expired as (
    select r.id
    from public.account_deletion_requests r
    join public.account_deletion_jobs j on j.request_id=r.id
    where r.status='fulfilled' and r.user_id is null
      and r.fulfilled_at < now()-interval '90 days'
      and j.state='fulfilled' and j.phase='verified'
      and j.target_user_id is null
      and j.completed_at < now()-interval '90 days'
      and j.lease_token is null and j.lease_until is null
    order by r.fulfilled_at
    limit 1000
    for update of r skip locked
  ), deleted as (
    delete from public.account_deletion_requests r using expired e
    where r.id=e.id returning r.id
  ) select count(*) into removed from deleted;
  return removed;
end $$;
revoke all on function private.cleanup_account_deletion_receipts() from public,anon,authenticated;
grant execute on function private.cleanup_account_deletion_receipts() to service_role;

create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('privacy-receipt-expiry','10 3 * * *',
  'select private.cleanup_account_deletion_receipts();');
