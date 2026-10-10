begin;
do $$
declare old_id uuid:=gen_random_uuid(); fresh_id uuid:=gen_random_uuid(); failed_id uuid:=gen_random_uuid(); linked_id uuid:=gen_random_uuid(); late_id uuid:=gen_random_uuid();
begin
 insert into public.account_deletion_requests(id,status,fulfilled_at)
 values(old_id,'fulfilled',now()-interval '91 days'),(fresh_id,'fulfilled',now()-interval '89 days'),(linked_id,'fulfilled',now()-interval '91 days'),(late_id,'fulfilled',now()-interval '91 days');
 insert into public.account_deletion_requests(id,status,reviewed_at) values(failed_id,'reviewing',now()-interval '91 days');
 insert into public.account_deletion_jobs(request_id,state,phase,completed_at,target_user_id)
 values(old_id,'fulfilled','verified',now()-interval '91 days',null),(fresh_id,'fulfilled','verified',now()-interval '89 days',null),(failed_id,'failed','database',null,gen_random_uuid()),(linked_id,'fulfilled','verified',now()-interval '91 days',gen_random_uuid()),(late_id,'fulfilled','verified',now(),null);
 perform private.cleanup_account_deletion_receipts();
 if exists(select 1 from public.account_deletion_requests where id=old_id) or exists(select 1 from public.account_deletion_jobs where request_id=old_id) then raise exception 'Expired verified receipt remains'; end if;
 if (select count(*) from public.account_deletion_requests where id in(fresh_id,failed_id,linked_id,late_id))<>4 then raise exception 'Ineligible case removed'; end if;
 if has_function_privilege('anon','private.cleanup_account_deletion_receipts()','EXECUTE') or has_function_privilege('authenticated','private.cleanup_account_deletion_receipts()','EXECUTE') then raise exception 'Client cleanup exposed'; end if;
end $$;
rollback;
select 'PASS: expired verified receipt/job removed; fresh, failed, linked and recently completed cases preserved; client execution denied; rolled back' as verification;
select jobname,schedule,active from cron.job where jobname='privacy-receipt-expiry';
