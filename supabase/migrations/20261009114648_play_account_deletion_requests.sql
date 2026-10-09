-- Server-only request queue. Actions authenticate the requester and check real
-- platform roles before using the service adapter. No direct client API access.
create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'fulfilled')),
  created_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  fulfilled_at timestamptz,
  check (status <> 'reviewing' or reviewed_at is not null),
  check (status <> 'fulfilled' or fulfilled_at is not null)
);
create index account_deletion_requests_queue_idx
  on public.account_deletion_requests(created_at) where status in ('pending', 'reviewing');
alter table public.account_deletion_requests enable row level security;
revoke all on public.account_deletion_requests from public, anon, authenticated;
grant select, insert, update, delete on public.account_deletion_requests to service_role;
comment on table public.account_deletion_requests is
  'Private deletion request queue. Fulfilment requires actual data deletion and verified retention handling; a request is not fulfilment.';
