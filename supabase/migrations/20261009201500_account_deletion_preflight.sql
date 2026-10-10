-- Read-only inventory. This neither deletes accounts nor certifies fulfilment.
create or replace function public.account_deletion_preflight(request_id_input uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
  request_status text;
  relation record;
  matches bigint;
  relations jsonb := '[]'::jsonb;
  storage_count bigint;
begin
  select user_id, status into target, request_status
  from public.account_deletion_requests where id = request_id_input;
  if not found or target is null or request_status = 'fulfilled' then
    raise exception 'PRIVACY_PREFLIGHT_UNAVAILABLE';
  end if;

  -- Count direct identity dependencies, including SET NULL and RESTRICT rows.
  -- Nested records, JSON snapshots, logs and backups require additional review.
  for relation in
    select distinct ns.nspname as schema_name, t.relname as table_name,
      a.attname as column_name, c.confdeltype as deletion_rule
    from pg_catalog.pg_constraint c
    join pg_catalog.pg_class t on t.oid = c.conrelid
    join pg_catalog.pg_namespace ns on ns.oid = t.relnamespace
    cross join lateral unnest(c.conkey) keys(attnum)
    join pg_catalog.pg_attribute a on a.attrelid = t.oid and a.attnum = keys.attnum
    where c.contype = 'f' and ns.nspname = 'public'
      and c.confrelid in ('auth.users'::regclass, 'public.profiles'::regclass)
    order by ns.nspname, t.relname, a.attname
  loop
    execute format('select count(*) from %I.%I where %I = $1',
      relation.schema_name, relation.table_name, relation.column_name)
      into matches using target;
    if matches > 0 then
      relations := relations || jsonb_build_array(jsonb_build_object(
        'table', relation.table_name, 'column', relation.column_name,
        'count', matches, 'rule', case relation.deletion_rule
          when 'c' then 'cascade' when 'n' then 'set_null'
          when 'r' then 'restrict' when 'd' then 'set_default'
          else 'no_action' end));
    end if;
  end loop;

  select count(*) into storage_count from storage.objects
  where owner_id = target::text or owner = target
    or (bucket_id = 'quest-evidence' and split_part(name, '/', 1) = target::text);

  return jsonb_build_object(
    'requestId', request_id_input, 'status', request_status,
    'accountPresent', exists(select 1 from auth.users where id = target),
    'storageObjects', storage_count, 'relations', relations,
    'scope', 'direct_identity_dependencies_only',
    'deleted', false, 'readyToDelete', false);
end;
$$;
revoke all on function public.account_deletion_preflight(uuid) from public, anon, authenticated;
grant execute on function public.account_deletion_preflight(uuid) to service_role;
comment on function public.account_deletion_preflight(uuid) is
  'Service-only read-only inventory; counts are not a deletion plan or fulfilment proof.';
