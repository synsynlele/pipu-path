-- Stop automatic deletion when the reviewed FK graph changes. New tables and
-- ownership/hold relationships require a new erasure review, not blind purge.
create or replace function private.require_account_deletion_schema()
returns void language plpgsql security definer set search_path='' as $$
declare fingerprint text;
begin
  select md5(string_agg(format('%s.%s:%s:%s.%s:%s:%s:%s',n.nspname,t.relname,a.attname,pn.nspname,p.relname,pa.attname,c.confdeltype,c.condeferrable),',' order by n.nspname,t.relname,a.attname,pn.nspname,p.relname,pa.attname,c.confdeltype,c.condeferrable)) into fingerprint
  from pg_catalog.pg_constraint c
  join pg_catalog.pg_class t on t.oid=c.conrelid join pg_catalog.pg_namespace n on n.oid=t.relnamespace
  join pg_catalog.pg_class p on p.oid=c.confrelid join pg_catalog.pg_namespace pn on pn.oid=p.relnamespace
  cross join lateral unnest(c.conkey) with ordinality k(attnum,pos)
  join pg_catalog.pg_attribute a on a.attrelid=t.oid and a.attnum=k.attnum
  join pg_catalog.pg_attribute pa on pa.attrelid=p.oid and pa.attnum=c.confkey[k.pos::int]
  where c.contype='f' and n.nspname='public';
  if fingerprint is distinct from '4348d4176ba3e68a4246d7cb2d545071' then
    raise exception 'PRIVACY_SCHEMA_REVIEW_REQUIRED';
  end if;
end; $$;
revoke all on function private.require_account_deletion_schema() from public,anon,authenticated;

-- Retain original ACLs and routine signatures. Insert the guard at the first
-- BEGIN, before any claim/purge/completion side effect. Existing roles are
-- rechecked at processing checkpoints so revoked operators cannot continue.
do $$
declare routine regprocedure; definition text;
begin
  foreach routine in array array[
    'public.claim_account_deletion_job(uuid,uuid)'::regprocedure,
    'public.purge_account_deletion_data(uuid,uuid)'::regprocedure,
    'public.finish_account_deletion_job(uuid,uuid)'::regprocedure,
    'public.account_deletion_storage_batch(uuid,uuid)'::regprocedure
  ] loop
    definition := pg_get_functiondef(routine);
    if strpos(definition,E'\nbegin\n')=0 then raise exception 'Deletion routine guard insertion failed'; end if;
    definition := regexp_replace(definition,E'\nbegin\n',E'\nbegin\n  perform private.require_account_deletion_schema();\n');
    definition := replace(definition,
      'then raise exception ''PRIVACY_JOB_LEASE_INVALID''; end if;',
      'then raise exception ''PRIVACY_JOB_LEASE_INVALID''; end if;
  if not exists(select 1 from public.platform_admins where user_id=j.operator_id and status=''active'' and role in (''owner'',''operator'')) then raise exception ''PRIVACY_OPERATOR_REVOKED''; end if;');
    execute definition;
  end loop;
end $$;
