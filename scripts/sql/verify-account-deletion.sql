-- Disposable database-only fixtures, all rolled back. Does not exercise the
-- external Storage or Auth Admin APIs or certify production activation.
begin;
do $$
declare
  u uuid:=gen_random_uuid(); op uuid:=gen_random_uuid(); other_user uuid:=gen_random_uuid();
  r uuid; interpretation uuid; hpi uuid; mission_request uuid; mission uuid;
  journey_request uuid; journey uuid; builder_profile uuid; passport uuid; lease jsonb; token uuid;
begin
  insert into auth.users(id,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data)
  values(u,'deletion-fixture-'||u||'@example.test',now(),'{}','{}'),
    (op,'deletion-operator-'||op||'@example.test',now(),'{}','{}'),
    (other_user,'deletion-unrelated-'||other_user||'@example.test',now(),'{}','{}');
  insert into public.platform_admins(user_id,role) values(op,'operator');
  insert into public.interpretation_requests(user_id,question_set_version,interpretation_schema_version,prompt_version,consent_policy_version,age_band,is_minor,idempotency_key)
    values(u,2,'fixture','fixture','fixture','25_plus',false,gen_random_uuid()) returning id into interpretation;
  insert into public.human_potential_profile_versions(user_id,version,source_interpretation_request_id,schema_version)
    values(u,1,interpretation,'fixture') returning id into hpi;
  insert into public.mission_generation_requests(user_id,human_potential_profile_id,generation_kind,prompt_version)
    values(u,hpi,'initial','fixture') returning id into mission_request;
  insert into public.user_missions(user_id,human_potential_profile_id,generation_request_id,title,mission_statement,why_this_fits,who_this_helps,first_meaningful_outcome,time_horizon,success_signal,current_caution,profile_evidence_refs,model,prompt_version)
    values(u,hpi,mission_request,'Fixture mission','A disposable mission for verification','A disposable private mission to verify deletion','Fixture team','An observable fixture outcome','two_weeks','Fixture completion','Only disposable fixtures',array[gen_random_uuid(),gen_random_uuid()],'fixture','fixture') returning id into mission;
  update public.mission_generation_requests set source_mission_id=mission where id=mission_request;
  insert into public.journey_generation_requests(user_id,mission_id,generation_kind,prompt_version)
    values(u,mission,'initial','fixture') returning id into journey_request;
  insert into public.user_journeys(user_id,mission_id,generation_request_id,title,summary,target_outcome,suggested_duration,model,prompt_version)
    values(u,mission,journey_request,'Fixture journey','A private fixture journey for deletion verification','A deleted fixture outcome','two_weeks','fixture','fixture') returning id into journey;
  update public.journey_generation_requests set source_journey_id=journey where id=journey_request;
  insert into public.builder_profile_versions(user_id,version,source_human_potential_profile_id,rules_version,evidence_cutoff_at)
    values(u,1,hpi,'stage16.v1',now()) returning id into builder_profile;
  insert into public.builder_passport_versions(user_id,version,source_profile_version_id,display_name_snapshot,consent_policy_version)
    values(u,1,builder_profile,'Disposable builder','builder-passport-v1') returning id into passport;
  insert into public.account_deletion_requests(user_id,status,reviewed_by,reviewed_at)
    values(u,'reviewing',op,now()) returning id into r;
  insert into public.builder_reports(reporter_id,reported_id,reason_code) values(other_user,u,'spam');
  begin
    perform public.claim_account_deletion_job(r,op);
    raise exception 'Safeguarding review bypassed';
  exception when others then if sqlerrm <> 'PRIVACY_MANUAL_REVIEW_REQUIRED' then raise; end if; end;
  delete from public.builder_reports where reporter_id=other_user and reported_id=u;
  begin
    perform public.claim_account_deletion_job(r,other_user);
    raise exception 'Non-operator claim accepted';
  exception when others then if sqlerrm <> 'FORBIDDEN' then raise; end if; end;
  lease:=public.claim_account_deletion_job(r,op); token:=(lease->>'leaseToken')::uuid;
  begin
    perform public.claim_account_deletion_job(r,op);
    raise exception 'A second worker claimed an active lease';
  exception when others then if sqlerrm <> 'PRIVACY_JOB_BUSY' then raise; end if; end;
  begin
    perform public.take_over_account_deletion_review(r,op);
    raise exception 'Active worker lease reassigned';
  exception when others then if sqlerrm <> 'PRIVACY_JOB_BUSY' then raise; end if; end;
  perform public.purge_account_deletion_data(r,token);
  if exists(select 1 from public.builder_passport_versions where id=passport)
    or exists(select 1 from public.builder_profile_versions where id=builder_profile)
    or exists(select 1 from public.user_missions where id=mission)
    or exists(select 1 from public.mission_generation_requests where id=mission_request)
    or exists(select 1 from public.user_journeys where id=journey)
    or exists(select 1 from public.journey_generation_requests where id=journey_request)
    or exists(select 1 from public.profiles where id=u)
  then raise exception 'Developmental data remains'; end if;
  if not exists(select 1 from public.profiles where id=other_user) then raise exception 'Unrelated account changed'; end if;
  perform public.account_deletion_storage_batch(r,token);
  begin
    perform public.finish_account_deletion_job(r,token);
    raise exception 'Premature fulfilment accepted';
  exception when others then if sqlerrm <> 'PRIVACY_DELETION_NOT_VERIFIED' then raise; end if; end;
  -- Simulates Auth API removal for database assertions only.
  delete from auth.users where id=u;
  -- Resume after Auth removal and an interrupted verification call.
  perform public.fail_account_deletion_job(r,token);
  insert into public.platform_admins(user_id,role) values(other_user,'operator');
  perform public.take_over_account_deletion_review(r,other_user);
  begin
    perform public.claim_account_deletion_job(r,op);
    raise exception 'Prior reviewer retained processing authority';
  exception when others then if sqlerrm <> 'PRIVACY_REVIEW_REQUIRED' then raise; end if; end;
  lease:=public.claim_account_deletion_job(r,other_user); token:=(lease->>'leaseToken')::uuid;
  perform public.purge_account_deletion_data(r,token);
  perform public.account_deletion_storage_batch(r,token);
  perform public.finish_account_deletion_job(r,token);
  if not exists(select 1 from public.account_deletion_requests where id=r and status='fulfilled' and user_id is null)
    or not exists(select 1 from public.account_deletion_jobs where request_id=r and state='fulfilled' and target_user_id is null)
  then raise exception 'Verified receipt missing'; end if;
  if has_function_privilege('anon','public.claim_account_deletion_job(uuid,uuid)','EXECUTE')
    or has_function_privilege('authenticated','public.purge_account_deletion_data(uuid,uuid)','EXECUTE')
  then raise exception 'Client execution exposed'; end if;
end $$;
rollback;
select 'PASS: restrictive Mission/Journey cycles, lease exclusivity, unrelated-account preservation and verified receipt; fixtures rolled back' as verification;
