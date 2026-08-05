-- Stage 10 repair: avoid collision with PostgreSQL's CURRENT_TIME keyword.
create or replace function public.consume_stage10_auth_rate_limit(
  action_input text,
  key_hash_input text,
  limit_input integer default 8,
  window_seconds_input integer default 60
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  bucket public.auth_rate_limit_buckets%rowtype;
  now_value timestamptz := clock_timestamp();
  inserted_count integer := 0;
begin
  if action_input not in ('signin', 'signup', 'recovery')
    or key_hash_input !~ '^[a-f0-9]{64}$'
    or limit_input not between 1 and 100
    or window_seconds_input not between 10 and 3600 then
    return false;
  end if;

  insert into public.auth_rate_limit_buckets (
    bucket_key,
    action,
    attempts,
    window_started_at,
    updated_at
  ) values (
    key_hash_input,
    action_input,
    1,
    now_value,
    now_value
  )
  on conflict (bucket_key) do nothing;

  get diagnostics inserted_count = row_count;

  select * into bucket
  from public.auth_rate_limit_buckets
  where bucket_key = key_hash_input
  for update;

  if bucket.action <> action_input then
    return false;
  end if;

  if bucket.window_started_at + make_interval(secs => window_seconds_input) <= now_value then
    update public.auth_rate_limit_buckets
    set attempts = 1,
        window_started_at = now_value,
        updated_at = now_value
    where bucket_key = key_hash_input;
    return true;
  end if;

  if inserted_count = 1 then
    return true;
  end if;

  if bucket.attempts >= limit_input then
    return false;
  end if;

  update public.auth_rate_limit_buckets
  set attempts = attempts + 1,
      updated_at = now_value
  where bucket_key = key_hash_input;

  return true;
end
$$;

revoke all on function public.consume_stage10_auth_rate_limit(text, text, integer, integer)
from public;
grant execute on function public.consume_stage10_auth_rate_limit(text, text, integer, integer)
to anon, authenticated;
