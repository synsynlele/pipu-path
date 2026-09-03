-- Stage 29: Builder Network foundation.
-- Purposeful social activity is bounded by live Builder eligibility, school policy,
-- accepted relationships and existing safeguarding/blocking authority.

create table public.builder_network_school_settings (
  workspace_id uuid primary key references public.institution_workspaces(id) on delete cascade,
  network_enabled boolean not null default false,
  cross_school_enabled boolean not null default false,
  direct_messages_enabled boolean not null default false,
  policy_version text not null default 'builder-network-school-v1',
  updated_by_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.builder_network_participation (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  scope text not null check (scope in ('adult', 'school')),
  school_workspace_id uuid references public.institution_workspaces(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'withdrawn')),
  consent_policy_version text not null,
  joined_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_network_participation_scope_consistency check (
    (scope = 'adult' and school_workspace_id is null)
    or (scope = 'school' and school_workspace_id is not null)
  )
);

create table public.builder_network_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  school_workspace_id uuid references public.institution_workspaces(id) on delete cascade,
  project_id uuid references public.builder_projects(id) on delete set null,
  kind text not null check (kind in ('build_update', 'milestone', 'help_request', 'insight')),
  body text not null check (char_length(body) between 20 and 1000),
  status text not null default 'published' check (status in ('published', 'deleted')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.builder_network_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.builder_network_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 500),
  status text not null default 'published' check (status in ('published', 'deleted')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.builder_network_reactions (
  post_id uuid not null references public.builder_network_posts(id) on delete cascade,
  reactor_id uuid not null references public.profiles(id) on delete cascade,
  reaction_code text not null check (reaction_code in ('useful', 'can_help', 'keep_building')),
  created_at timestamptz not null default now(),
  primary key (post_id, reactor_id)
);

create table public.builder_network_conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.profiles(id) on delete cascade,
  participant_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_network_conversations_distinct check (participant_a <> participant_b),
  constraint builder_network_conversations_ordered check (participant_a < participant_b),
  constraint builder_network_conversations_pair_unique unique (participant_a, participant_b)
);

create table public.builder_network_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.builder_network_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1200),
  status text not null default 'sent' check (status in ('sent', 'deleted')),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.builder_network_message_reads (
  conversation_id uuid not null references public.builder_network_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table public.builder_network_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.builder_network_posts(id) on delete set null,
  comment_id uuid references public.builder_network_comments(id) on delete set null,
  message_id uuid references public.builder_network_messages(id) on delete set null,
  reason_code text not null check (reason_code in ('spam', 'harassment', 'unsafe_contact', 'impersonation', 'inappropriate_content', 'other')),
  detail text check (detail is null or char_length(detail) <= 500),
  status text not null default 'open' check (status in ('open', 'reviewing', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_network_reports_distinct_people check (reporter_id <> target_user_id)
);

create index builder_network_posts_author_time_idx
  on public.builder_network_posts(author_id, created_at desc)
  where status = 'published';
create index builder_network_posts_school_time_idx
  on public.builder_network_posts(school_workspace_id, created_at desc)
  where status = 'published';
create index builder_network_comments_post_time_idx
  on public.builder_network_comments(post_id, created_at)
  where status = 'published';
create index builder_network_messages_conversation_time_idx
  on public.builder_network_messages(conversation_id, created_at desc)
  where status = 'sent';
create index builder_network_reports_status_time_idx
  on public.builder_network_reports(status, created_at desc);

create trigger builder_network_school_settings_updated_at
before update on public.builder_network_school_settings
for each row execute function public.set_updated_at();
create trigger builder_network_participation_updated_at
before update on public.builder_network_participation
for each row execute function public.set_updated_at();
create trigger builder_network_posts_updated_at
before update on public.builder_network_posts
for each row execute function public.set_updated_at();
create trigger builder_network_comments_updated_at
before update on public.builder_network_comments
for each row execute function public.set_updated_at();
create trigger builder_network_conversations_updated_at
before update on public.builder_network_conversations
for each row execute function public.set_updated_at();
create trigger builder_network_reports_updated_at
before update on public.builder_network_reports
for each row execute function public.set_updated_at();

alter table public.builder_network_school_settings enable row level security;
alter table public.builder_network_participation enable row level security;
alter table public.builder_network_posts enable row level security;
alter table public.builder_network_comments enable row level security;
alter table public.builder_network_reactions enable row level security;
alter table public.builder_network_conversations enable row level security;
alter table public.builder_network_messages enable row level security;
alter table public.builder_network_message_reads enable row level security;
alter table public.builder_network_reports enable row level security;

revoke all on public.builder_network_school_settings,
  public.builder_network_participation,
  public.builder_network_posts,
  public.builder_network_comments,
  public.builder_network_reactions,
  public.builder_network_conversations,
  public.builder_network_messages,
  public.builder_network_message_reads,
  public.builder_network_reports
from public, anon, authenticated;

grant select, insert, update, delete on public.builder_network_school_settings,
  public.builder_network_participation,
  public.builder_network_posts,
  public.builder_network_comments,
  public.builder_network_reactions,
  public.builder_network_conversations,
  public.builder_network_messages,
  public.builder_network_message_reads,
  public.builder_network_reports
to service_role;

create or replace function private.stage29_candidate_scope(user_id_input uuid)
returns table(scope text, workspace_id uuid)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if private.stage11_builder_connect_eligible(user_id_input) then
    return query select 'adult'::text, null::uuid;
    return;
  end if;

  return query
  select 'school'::text, workspace.id
  from public.profiles profile
  join public.onboarding_checkpoints checkpoint
    on checkpoint.user_id = profile.id and checkpoint.status = 'completed'
  join public.khpos_school_cohort_memberships membership
    on membership.user_id = profile.id and membership.status = 'active'
  join public.khpos_school_cohorts cohort
    on cohort.id = membership.cohort_id and cohort.status = 'active'
  join public.institution_workspaces workspace
    on workspace.cohort_id = cohort.id and workspace.status = 'active'
  join public.builder_network_school_settings settings
    on settings.workspace_id = workspace.id and settings.network_enabled
  where profile.id = user_id_input
    and profile.account_status = 'active'
    and profile.age_band in ('13_15', '16_17')
    and not coalesce(profile.safeguarding_review_required, false)
    and profile.username is not null
  limit 1;
end;
$$;

create or replace function private.stage29_live_scope(user_id_input uuid)
returns table(scope text, workspace_id uuid)
language sql
stable
security definer
set search_path = ''
as $$
  select participation.scope, participation.school_workspace_id
  from public.builder_network_participation participation
  where participation.user_id = user_id_input
    and participation.status = 'active'
    and exists (
      select 1
      from private.stage29_candidate_scope(user_id_input) candidate
      where candidate.scope = participation.scope
        and candidate.workspace_id is not distinct from participation.school_workspace_id
    )
  limit 1;
$$;

create or replace function private.stage29_pair_visible(first_user uuid, second_user uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  first_scope text;
  first_workspace uuid;
  second_scope text;
  second_workspace uuid;
begin
  if first_user = second_user then return true; end if;
  if private.stage11_builder_pair_blocked(first_user, second_user) then return false; end if;

  select scope, workspace_id into first_scope, first_workspace
  from private.stage29_live_scope(first_user);
  select scope, workspace_id into second_scope, second_workspace
  from private.stage29_live_scope(second_user);

  if first_scope is null or second_scope is null then return false; end if;
  if first_scope = 'adult' and second_scope = 'adult' then return true; end if;
  if first_scope <> 'school' or second_scope <> 'school' then return false; end if;
  if first_workspace = second_workspace then return true; end if;

  return exists (
    select 1
    from public.builder_network_school_settings first_settings,
         public.builder_network_school_settings second_settings
    where first_settings.workspace_id = first_workspace
      and second_settings.workspace_id = second_workspace
      and first_settings.network_enabled
      and second_settings.network_enabled
      and first_settings.cross_school_enabled
      and second_settings.cross_school_enabled
  );
end;
$$;

create or replace function private.stage29_pair_message_allowed(first_user uuid, second_user uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  first_scope text;
  first_workspace uuid;
  second_scope text;
  second_workspace uuid;
begin
  if not private.stage29_pair_visible(first_user, second_user) then return false; end if;
  if not exists (
    select 1 from public.builder_connections connection
    where connection.status = 'accepted'
      and least(connection.requester_id, connection.recipient_id) = least(first_user, second_user)
      and greatest(connection.requester_id, connection.recipient_id) = greatest(first_user, second_user)
  ) then return false; end if;

  select scope, workspace_id into first_scope, first_workspace from private.stage29_live_scope(first_user);
  select scope, workspace_id into second_scope, second_workspace from private.stage29_live_scope(second_user);
  if first_scope = 'adult' and second_scope = 'adult' then return true; end if;

  return exists (
    select 1
    from public.builder_network_school_settings first_settings,
         public.builder_network_school_settings second_settings
    where first_settings.workspace_id = first_workspace
      and second_settings.workspace_id = second_workspace
      and first_settings.direct_messages_enabled
      and second_settings.direct_messages_enabled
      and first_settings.network_enabled
      and second_settings.network_enabled
  );
end;
$$;

revoke all on function private.stage29_candidate_scope(uuid),
  private.stage29_live_scope(uuid),
  private.stage29_pair_visible(uuid, uuid),
  private.stage29_pair_message_allowed(uuid, uuid)
from public, anon, authenticated;

create or replace function public.join_stage29_builder_network(policy_version_input text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  candidate_scope text;
  candidate_workspace uuid;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  if trim(coalesce(policy_version_input, '')) <> 'builder-network-participation-v1' then
    raise exception 'BUILDER_NETWORK_POLICY_REQUIRED' using errcode = 'P0001';
  end if;

  select scope, workspace_id into candidate_scope, candidate_workspace
  from private.stage29_candidate_scope(actor);
  if candidate_scope is null then
    raise exception 'BUILDER_NETWORK_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  insert into public.builder_network_participation(
    user_id, scope, school_workspace_id, status, consent_policy_version,
    joined_at, withdrawn_at
  ) values (
    actor, candidate_scope, candidate_workspace, 'active',
    'builder-network-participation-v1', now(), null
  )
  on conflict(user_id) do update
    set scope = excluded.scope,
        school_workspace_id = excluded.school_workspace_id,
        status = 'active',
        consent_policy_version = excluded.consent_policy_version,
        joined_at = now(),
        withdrawn_at = null,
        updated_at = now();

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values(actor, 'builder_network_joined', 'success', jsonb_build_object(
    'scope', candidate_scope,
    'workspace_id', candidate_workspace,
    'policy_version', 'builder-network-participation-v1'
  ));

  return jsonb_build_object('joined', true, 'scope', candidate_scope, 'workspaceId', candidate_workspace);
end;
$$;

create or replace function public.withdraw_stage29_builder_network()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); changed boolean;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  update public.builder_network_participation
  set status = 'withdrawn', withdrawn_at = now(), updated_at = now()
  where user_id = actor and status = 'active';
  changed := found;
  if changed then
    insert into public.identity_audit_events(user_id, operation, result, metadata)
    values(actor, 'builder_network_withdrawn', 'success', jsonb_build_object('policy_version', 'builder-network-participation-v1'));
  end if;
  return changed;
end;
$$;

create or replace function public.create_stage29_builder_network_post(
  kind_input text,
  body_input text,
  project_id_input uuid default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  actor_scope text;
  actor_workspace uuid;
  post_id uuid;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  select scope, workspace_id into actor_scope, actor_workspace from private.stage29_live_scope(actor);
  if actor_scope is null then raise exception 'BUILDER_NETWORK_NOT_ACTIVE' using errcode = 'P0001'; end if;
  if kind_input not in ('build_update', 'milestone', 'help_request', 'insight')
     or coalesce(char_length(trim(body_input)), 0) not between 20 and 1000 then
    raise exception 'BUILDER_NETWORK_POST_INVALID' using errcode = 'P0001';
  end if;
  if project_id_input is not null and not exists (
    select 1 from public.builder_projects project
    where project.id = project_id_input and project.user_id = actor
  ) then raise exception 'BUILDER_NETWORK_PROJECT_INVALID' using errcode = 'P0001'; end if;

  insert into public.builder_network_posts(author_id, school_workspace_id, project_id, kind, body)
  values(actor, actor_workspace, project_id_input, kind_input, trim(body_input))
  returning id into post_id;
  return post_id;
end;
$$;

create or replace function public.delete_stage29_builder_network_post(post_id_input uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  update public.builder_network_posts
  set status = 'deleted', deleted_at = now(), updated_at = now()
  where id = post_id_input and author_id = actor and status = 'published';
  return found;
end;
$$;

create or replace function public.add_stage29_builder_network_comment(post_id_input uuid, body_input text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); post_author uuid; comment_id uuid;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  if not exists(select 1 from private.stage29_live_scope(actor)) then
    raise exception 'BUILDER_NETWORK_NOT_ACTIVE' using errcode = 'P0001';
  end if;
  if coalesce(char_length(trim(body_input)), 0) not between 2 and 500 then
    raise exception 'BUILDER_NETWORK_COMMENT_INVALID' using errcode = 'P0001';
  end if;
  select author_id into post_author from public.builder_network_posts
  where id = post_id_input and status = 'published';
  if post_author is null or not private.stage29_pair_visible(actor, post_author) then
    raise exception 'BUILDER_NETWORK_POST_NOT_FOUND' using errcode = 'P0001';
  end if;
  insert into public.builder_network_comments(post_id, author_id, body)
  values(post_id_input, actor, trim(body_input)) returning id into comment_id;
  return comment_id;
end;
$$;

create or replace function public.set_stage29_builder_network_reaction(post_id_input uuid, reaction_code_input text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); post_author uuid; existing_code text;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  if reaction_code_input not in ('useful', 'can_help', 'keep_building') then
    raise exception 'BUILDER_NETWORK_REACTION_INVALID' using errcode = 'P0001';
  end if;
  select author_id into post_author from public.builder_network_posts
  where id = post_id_input and status = 'published';
  if post_author is null or not private.stage29_pair_visible(actor, post_author) then
    raise exception 'BUILDER_NETWORK_POST_NOT_FOUND' using errcode = 'P0001';
  end if;
  select reaction_code into existing_code from public.builder_network_reactions
  where post_id = post_id_input and reactor_id = actor;
  if existing_code = reaction_code_input then
    delete from public.builder_network_reactions where post_id = post_id_input and reactor_id = actor;
    return 'removed';
  end if;
  insert into public.builder_network_reactions(post_id, reactor_id, reaction_code)
  values(post_id_input, actor, reaction_code_input)
  on conflict(post_id, reactor_id) do update set reaction_code = excluded.reaction_code, created_at = now();
  return 'set';
end;
$$;

create or replace function public.send_stage29_builder_network_connection_request(target_user_id_input uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); existing public.builder_connections%rowtype; connection_id uuid;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  if actor = target_user_id_input then raise exception 'BUILDER_NETWORK_SELF_REQUEST' using errcode = 'P0001'; end if;
  if not private.stage29_pair_visible(actor, target_user_id_input) then
    raise exception 'BUILDER_NETWORK_RELATIONSHIP_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  select * into existing from public.builder_connections connection
  where least(connection.requester_id, connection.recipient_id) = least(actor, target_user_id_input)
    and greatest(connection.requester_id, connection.recipient_id) = greatest(actor, target_user_id_input)
  for update;
  if existing.id is not null and existing.status in ('pending', 'accepted') then
    raise exception 'BUILDER_NETWORK_REQUEST_EXISTS' using errcode = 'P0001';
  end if;
  if existing.id is null then
    insert into public.builder_connections(requester_id, recipient_id)
    values(actor, target_user_id_input) returning id into connection_id;
  else
    update public.builder_connections
    set requester_id = actor, recipient_id = target_user_id_input, status = 'pending',
        requested_at = now(), responded_at = null, accepted_at = null, closed_at = null
    where id = existing.id returning id into connection_id;
    delete from public.builder_contact_shares where connection_id = existing.id;
  end if;
  return connection_id;
end;
$$;

create or replace function public.respond_stage29_builder_network_connection(connection_id_input uuid, accept_input boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); target public.builder_connections%rowtype;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  select * into target from public.builder_connections
  where id = connection_id_input and recipient_id = actor and status = 'pending'
  for update;
  if target.id is null then raise exception 'BUILDER_NETWORK_REQUEST_NOT_FOUND' using errcode = 'P0001'; end if;
  if accept_input and not private.stage29_pair_visible(target.requester_id, target.recipient_id) then
    raise exception 'BUILDER_NETWORK_RELATIONSHIP_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  update public.builder_connections
  set status = case when accept_input then 'accepted'::public.builder_connection_status else 'declined'::public.builder_connection_status end,
      responded_at = now(), accepted_at = case when accept_input then now() else null end,
      closed_at = case when accept_input then null else now() end
  where id = target.id;
  return true;
end;
$$;

create or replace function public.close_stage29_builder_network_connection(connection_id_input uuid, action_input text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); target public.builder_connections%rowtype; next_status public.builder_connection_status;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  select * into target from public.builder_connections
  where id = connection_id_input and actor in (requester_id, recipient_id)
  for update;
  if target.id is null then raise exception 'BUILDER_NETWORK_REQUEST_NOT_FOUND' using errcode = 'P0001'; end if;
  if action_input = 'cancel' and target.requester_id = actor and target.status = 'pending' then
    next_status := 'cancelled';
  elsif action_input = 'remove' and target.status = 'accepted' then
    next_status := 'removed';
  else
    raise exception 'BUILDER_NETWORK_ACTION_INVALID' using errcode = 'P0001';
  end if;
  update public.builder_connections set status = next_status, closed_at = now() where id = target.id;
  delete from public.builder_contact_shares where connection_id = target.id;
  return true;
end;
$$;

create or replace function public.block_stage29_builder_network_user(target_user_id_input uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  if actor = target_user_id_input then raise exception 'BUILDER_NETWORK_ACTION_INVALID' using errcode = 'P0001'; end if;
  insert into public.builder_blocks(blocker_id, blocked_id) values(actor, target_user_id_input) on conflict do nothing;
  update public.builder_connections set status = 'removed', closed_at = now()
  where status in ('pending', 'accepted')
    and least(requester_id, recipient_id) = least(actor, target_user_id_input)
    and greatest(requester_id, recipient_id) = greatest(actor, target_user_id_input);
  delete from public.builder_contact_shares shares
  using public.builder_connections connection
  where shares.connection_id = connection.id
    and least(connection.requester_id, connection.recipient_id) = least(actor, target_user_id_input)
    and greatest(connection.requester_id, connection.recipient_id) = greatest(actor, target_user_id_input);
  return true;
end;
$$;

create or replace function public.start_stage29_builder_network_conversation(target_user_id_input uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); conversation_id uuid; first_user uuid; second_user uuid;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  if not private.stage29_pair_message_allowed(actor, target_user_id_input) then
    raise exception 'BUILDER_NETWORK_MESSAGE_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  first_user := least(actor, target_user_id_input);
  second_user := greatest(actor, target_user_id_input);
  insert into public.builder_network_conversations(participant_a, participant_b)
  values(first_user, second_user)
  on conflict(participant_a, participant_b) do update set updated_at = now()
  returning id into conversation_id;
  return conversation_id;
end;
$$;

create or replace function public.send_stage29_builder_network_message(conversation_id_input uuid, body_input text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); target public.builder_network_conversations%rowtype; other_user uuid; message_id uuid;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  if coalesce(char_length(trim(body_input)), 0) not between 1 and 1200 then
    raise exception 'BUILDER_NETWORK_MESSAGE_INVALID' using errcode = 'P0001';
  end if;
  select * into target from public.builder_network_conversations
  where id = conversation_id_input and actor in (participant_a, participant_b);
  if target.id is null then raise exception 'BUILDER_NETWORK_CONVERSATION_NOT_FOUND' using errcode = 'P0001'; end if;
  other_user := case when target.participant_a = actor then target.participant_b else target.participant_a end;
  if not private.stage29_pair_message_allowed(actor, other_user) then
    raise exception 'BUILDER_NETWORK_MESSAGE_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  insert into public.builder_network_messages(conversation_id, sender_id, body)
  values(target.id, actor, trim(body_input)) returning id into message_id;
  update public.builder_network_conversations set updated_at = now() where id = target.id;
  return message_id;
end;
$$;

create or replace function public.mark_stage29_builder_network_conversation_read(conversation_id_input uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  if not exists (
    select 1 from public.builder_network_conversations conversation
    where conversation.id = conversation_id_input and actor in (conversation.participant_a, conversation.participant_b)
  ) then raise exception 'BUILDER_NETWORK_CONVERSATION_NOT_FOUND' using errcode = 'P0001'; end if;
  insert into public.builder_network_message_reads(conversation_id, user_id, last_read_at)
  values(conversation_id_input, actor, now())
  on conflict(conversation_id, user_id) do update set last_read_at = now();
  return true;
end;
$$;

create or replace function public.report_stage29_builder_network_user(
  target_user_id_input uuid,
  reason_code_input text,
  detail_input text default null,
  post_id_input uuid default null,
  comment_id_input uuid default null,
  message_id_input uuid default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); report_id uuid;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  if actor = target_user_id_input then raise exception 'BUILDER_NETWORK_ACTION_INVALID' using errcode = 'P0001'; end if;
  if reason_code_input not in ('spam', 'harassment', 'unsafe_contact', 'impersonation', 'inappropriate_content', 'other')
     or coalesce(char_length(trim(coalesce(detail_input, ''))), 0) > 500 then
    raise exception 'BUILDER_NETWORK_REPORT_INVALID' using errcode = 'P0001';
  end if;
  if not exists(select 1 from public.profiles where id = target_user_id_input and account_status = 'active') then
    raise exception 'BUILDER_NETWORK_TARGET_NOT_FOUND' using errcode = 'P0001';
  end if;
  insert into public.builder_network_reports(
    reporter_id, target_user_id, post_id, comment_id, message_id, reason_code, detail
  ) values (
    actor, target_user_id_input, post_id_input, comment_id_input, message_id_input,
    reason_code_input, nullif(trim(coalesce(detail_input, '')), '')
  ) returning id into report_id;
  return report_id;
end;
$$;

create or replace function public.get_stage29_builder_world(limit_input integer default 24)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  candidate_scope text;
  candidate_workspace uuid;
  live_scope text;
  live_workspace uuid;
  school_name text;
  result jsonb;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  select scope, workspace_id into candidate_scope, candidate_workspace from private.stage29_candidate_scope(actor);
  select scope, workspace_id into live_scope, live_workspace from private.stage29_live_scope(actor);
  if live_workspace is not null then
    select cohort.organisation_name into school_name
    from public.institution_workspaces workspace
    join public.khpos_school_cohorts cohort on cohort.id = workspace.cohort_id
    where workspace.id = live_workspace;
  end if;

  if live_scope is null then
    return jsonb_build_object(
      'eligible', candidate_scope is not null,
      'joined', false,
      'scope', candidate_scope,
      'schoolName', null,
      'feed', '[]'::jsonb,
      'builders', '[]'::jsonb,
      'incoming', '[]'::jsonb,
      'sent', '[]'::jsonb,
      'connections', '[]'::jsonb,
      'unreadMessages', 0
    );
  end if;

  select jsonb_build_object(
    'eligible', true,
    'joined', true,
    'scope', live_scope,
    'schoolName', school_name,
    'feed', coalesce((
      select jsonb_agg(item order by item->>'createdAt' desc)
      from (
        select jsonb_build_object(
          'id', post.id,
          'kind', post.kind,
          'body', post.body,
          'createdAt', post.created_at,
          'author', jsonb_build_object(
            'userId', profile.id,
            'username', profile.username::text,
            'preferredName', coalesce(profile.preferred_name, profile.display_name, profile.username::text)
          ),
          'schoolName', author_cohort.organisation_name,
          'project', case when project.id is null then null else jsonb_build_object('id', project.id, 'title', project.title) end,
          'myReaction', my_reaction.reaction_code,
          'reactions', jsonb_build_object(
            'useful', coalesce(reaction_counts.useful, 0),
            'canHelp', coalesce(reaction_counts.can_help, 0),
            'keepBuilding', coalesce(reaction_counts.keep_building, 0)
          ),
          'comments', coalesce(comments.items, '[]'::jsonb),
          'commentCount', coalesce(comments.total, 0)
        ) item
        from public.builder_network_posts post
        join public.profiles profile on profile.id = post.author_id
        left join public.builder_projects project on project.id = post.project_id
        left join public.institution_workspaces author_workspace on author_workspace.id = post.school_workspace_id
        left join public.khpos_school_cohorts author_cohort on author_cohort.id = author_workspace.cohort_id
        left join public.builder_network_reactions my_reaction
          on my_reaction.post_id = post.id and my_reaction.reactor_id = actor
        left join lateral (
          select
            count(*) filter(where reaction_code = 'useful')::integer useful,
            count(*) filter(where reaction_code = 'can_help')::integer can_help,
            count(*) filter(where reaction_code = 'keep_building')::integer keep_building
          from public.builder_network_reactions reaction where reaction.post_id = post.id
        ) reaction_counts on true
        left join lateral (
          select count(*)::integer total,
            coalesce(jsonb_agg(jsonb_build_object(
              'id', visible_comment.id,
              'body', visible_comment.body,
              'createdAt', visible_comment.created_at,
              'author', jsonb_build_object(
                'userId', comment_profile.id,
                'username', comment_profile.username::text,
                'preferredName', coalesce(comment_profile.preferred_name, comment_profile.display_name, comment_profile.username::text)
              )
            ) order by visible_comment.created_at) filter(where visible_comment.id is not null), '[]'::jsonb) items
          from (
            select comment.*
            from public.builder_network_comments comment
            where comment.post_id = post.id and comment.status = 'published'
              and private.stage29_pair_visible(actor, comment.author_id)
            order by comment.created_at desc
            limit 3
          ) visible_comment
          left join public.profiles comment_profile on comment_profile.id = visible_comment.author_id
        ) comments on true
        where post.status = 'published'
          and private.stage29_pair_visible(actor, post.author_id)
        order by post.created_at desc
        limit greatest(1, least(coalesce(limit_input, 24), 40))
      ) feed_rows
    ), '[]'::jsonb),
    'builders', coalesce((
      select jsonb_agg(jsonb_build_object(
        'userId', profile.id,
        'username', profile.username::text,
        'preferredName', coalesce(profile.preferred_name, profile.display_name, profile.username::text),
        'missionTitle', mission.title,
        'missionStatement', mission.mission_statement,
        'schoolName', cohort.organisation_name,
        'relationship', coalesce(connection.status::text, 'none')
      ) order by coalesce(profile.preferred_name, profile.display_name, profile.username::text))
      from public.builder_network_participation participation
      join public.profiles profile on profile.id = participation.user_id
      left join lateral (
        select title, mission_statement from public.user_missions
        where user_id = profile.id and status = 'active'
        order by created_at desc limit 1
      ) mission on true
      left join public.institution_workspaces workspace on workspace.id = participation.school_workspace_id
      left join public.khpos_school_cohorts cohort on cohort.id = workspace.cohort_id
      left join public.builder_connections connection
        on least(connection.requester_id, connection.recipient_id) = least(actor, profile.id)
       and greatest(connection.requester_id, connection.recipient_id) = greatest(actor, profile.id)
      where participation.status = 'active'
        and profile.id <> actor
        and private.stage29_pair_visible(actor, profile.id)
      limit 24
    ), '[]'::jsonb),
    'incoming', coalesce((
      select jsonb_agg(jsonb_build_object(
        'connectionId', connection.id,
        'userId', profile.id,
        'username', profile.username::text,
        'preferredName', coalesce(profile.preferred_name, profile.display_name, profile.username::text),
        'updatedAt', connection.updated_at
      ) order by connection.updated_at desc)
      from public.builder_connections connection
      join public.profiles profile on profile.id = connection.requester_id
      where connection.recipient_id = actor and connection.status = 'pending'
        and private.stage29_pair_visible(actor, profile.id)
    ), '[]'::jsonb),
    'sent', coalesce((
      select jsonb_agg(jsonb_build_object(
        'connectionId', connection.id,
        'userId', profile.id,
        'username', profile.username::text,
        'preferredName', coalesce(profile.preferred_name, profile.display_name, profile.username::text),
        'updatedAt', connection.updated_at
      ) order by connection.updated_at desc)
      from public.builder_connections connection
      join public.profiles profile on profile.id = connection.recipient_id
      where connection.requester_id = actor and connection.status = 'pending'
        and private.stage29_pair_visible(actor, profile.id)
    ), '[]'::jsonb),
    'connections', coalesce((
      select jsonb_agg(jsonb_build_object(
        'connectionId', connection.id,
        'userId', profile.id,
        'username', profile.username::text,
        'preferredName', coalesce(profile.preferred_name, profile.display_name, profile.username::text),
        'updatedAt', connection.updated_at,
        'canMessage', private.stage29_pair_message_allowed(actor, profile.id)
      ) order by connection.updated_at desc)
      from public.builder_connections connection
      join public.profiles profile
        on profile.id = case when connection.requester_id = actor then connection.recipient_id else connection.requester_id end
      where connection.status = 'accepted'
        and actor in (connection.requester_id, connection.recipient_id)
        and private.stage29_pair_visible(actor, profile.id)
    ), '[]'::jsonb),
    'unreadMessages', coalesce((
      select count(*)::integer
      from public.builder_network_messages message
      join public.builder_network_conversations conversation on conversation.id = message.conversation_id
      left join public.builder_network_message_reads read_state
        on read_state.conversation_id = conversation.id and read_state.user_id = actor
      where actor in (conversation.participant_a, conversation.participant_b)
        and message.sender_id <> actor
        and message.status = 'sent'
        and message.created_at > coalesce(read_state.last_read_at, '-infinity'::timestamptz)
        and private.stage29_pair_message_allowed(
          actor,
          case when conversation.participant_a = actor then conversation.participant_b else conversation.participant_a end
        )
    ), 0)
  ) into result;
  return result;
end;
$$;

create or replace function public.get_stage29_builder_network_conversations()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'conversationId', conversation.id,
      'otherUser', jsonb_build_object(
        'userId', profile.id,
        'username', profile.username::text,
        'preferredName', coalesce(profile.preferred_name, profile.display_name, profile.username::text)
      ),
      'lastMessage', last_message.body,
      'lastMessageAt', last_message.created_at,
      'unreadCount', coalesce(unread.unread_count, 0)
    ) order by coalesce(last_message.created_at, conversation.created_at) desc)
    from public.builder_network_conversations conversation
    join public.profiles profile
      on profile.id = case when conversation.participant_a = actor then conversation.participant_b else conversation.participant_a end
    left join lateral (
      select message.body, message.created_at
      from public.builder_network_messages message
      where message.conversation_id = conversation.id and message.status = 'sent'
      order by message.created_at desc limit 1
    ) last_message on true
    left join lateral (
      select count(*)::integer unread_count
      from public.builder_network_messages message
      left join public.builder_network_message_reads read_state
        on read_state.conversation_id = conversation.id and read_state.user_id = actor
      where message.conversation_id = conversation.id
        and message.sender_id <> actor
        and message.status = 'sent'
        and message.created_at > coalesce(read_state.last_read_at, '-infinity'::timestamptz)
    ) unread on true
    where actor in (conversation.participant_a, conversation.participant_b)
      and private.stage29_pair_message_allowed(actor, profile.id)
  ), '[]'::jsonb);
end;
$$;

create or replace function public.get_stage29_builder_network_conversation(conversation_id_input uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); target public.builder_network_conversations%rowtype; other_user uuid; other_profile public.profiles%rowtype;
begin
  if actor is null then raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001'; end if;
  select * into target from public.builder_network_conversations
  where id = conversation_id_input and actor in (participant_a, participant_b);
  if target.id is null then raise exception 'BUILDER_NETWORK_CONVERSATION_NOT_FOUND' using errcode = 'P0001'; end if;
  other_user := case when target.participant_a = actor then target.participant_b else target.participant_a end;
  if not private.stage29_pair_message_allowed(actor, other_user) then
    raise exception 'BUILDER_NETWORK_MESSAGE_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  select * into other_profile from public.profiles where id = other_user;
  return jsonb_build_object(
    'conversationId', target.id,
    'otherUser', jsonb_build_object(
      'userId', other_profile.id,
      'username', other_profile.username::text,
      'preferredName', coalesce(other_profile.preferred_name, other_profile.display_name, other_profile.username::text)
    ),
    'messages', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', message.id,
        'senderId', message.sender_id,
        'body', message.body,
        'createdAt', message.created_at
      ) order by message.created_at)
      from public.builder_network_messages message
      where message.conversation_id = target.id and message.status = 'sent'
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.get_stage29_school_network_settings(workspace_id_input uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); member_role public.institution_workspace_role; settings public.builder_network_school_settings%rowtype;
begin
  if actor is null then raise exception 'INSTITUTION_ACCESS_DENIED' using errcode = 'P0001'; end if;
  member_role := private.stage19_institution_member_role(workspace_id_input, actor);
  if member_role is null then raise exception 'INSTITUTION_ACCESS_DENIED' using errcode = 'P0001'; end if;
  select * into settings from public.builder_network_school_settings where workspace_id = workspace_id_input;
  return jsonb_build_object(
    'workspaceId', workspace_id_input,
    'role', member_role,
    'networkEnabled', coalesce(settings.network_enabled, false),
    'crossSchoolEnabled', coalesce(settings.cross_school_enabled, false),
    'directMessagesEnabled', coalesce(settings.direct_messages_enabled, false),
    'policyVersion', coalesce(settings.policy_version, 'builder-network-school-v1')
  );
end;
$$;

create or replace function public.set_stage29_school_network_settings(
  workspace_id_input uuid,
  network_enabled_input boolean,
  cross_school_enabled_input boolean,
  direct_messages_enabled_input boolean
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); member_role public.institution_workspace_role;
begin
  if actor is null then raise exception 'INSTITUTION_ACCESS_DENIED' using errcode = 'P0001'; end if;
  member_role := private.stage19_institution_member_role(workspace_id_input, actor);
  if member_role is distinct from 'owner'::public.institution_workspace_role then
    raise exception 'INSTITUTION_OWNER_REQUIRED' using errcode = 'P0001';
  end if;
  if not network_enabled_input and (cross_school_enabled_input or direct_messages_enabled_input) then
    raise exception 'BUILDER_NETWORK_SCHOOL_SETTINGS_INVALID' using errcode = 'P0001';
  end if;

  insert into public.builder_network_school_settings(
    workspace_id, network_enabled, cross_school_enabled, direct_messages_enabled,
    policy_version, updated_by_user_id
  ) values (
    workspace_id_input, network_enabled_input, cross_school_enabled_input,
    direct_messages_enabled_input, 'builder-network-school-v1', actor
  )
  on conflict(workspace_id) do update
    set network_enabled = excluded.network_enabled,
        cross_school_enabled = excluded.cross_school_enabled,
        direct_messages_enabled = excluded.direct_messages_enabled,
        policy_version = excluded.policy_version,
        updated_by_user_id = actor,
        updated_at = now();

  if not network_enabled_input then
    update public.builder_network_participation
    set status = 'withdrawn', withdrawn_at = now(), updated_at = now()
    where school_workspace_id = workspace_id_input and status = 'active';
  end if;

  insert into public.institution_audit_events(
    workspace_id, actor_user_id, operation, result, target_type, target_id, metadata
  ) values (
    workspace_id_input, actor, 'builder_network_settings_updated', 'success',
    'builder_network_settings', workspace_id_input::text,
    jsonb_build_object(
      'network_enabled', network_enabled_input,
      'cross_school_enabled', cross_school_enabled_input,
      'direct_messages_enabled', direct_messages_enabled_input,
      'policy_version', 'builder-network-school-v1'
    )
  );
  return true;
end;
$$;

revoke all on function public.join_stage29_builder_network(text),
  public.withdraw_stage29_builder_network(),
  public.create_stage29_builder_network_post(text, text, uuid),
  public.delete_stage29_builder_network_post(uuid),
  public.add_stage29_builder_network_comment(uuid, text),
  public.set_stage29_builder_network_reaction(uuid, text),
  public.send_stage29_builder_network_connection_request(uuid),
  public.respond_stage29_builder_network_connection(uuid, boolean),
  public.close_stage29_builder_network_connection(uuid, text),
  public.block_stage29_builder_network_user(uuid),
  public.start_stage29_builder_network_conversation(uuid),
  public.send_stage29_builder_network_message(uuid, text),
  public.mark_stage29_builder_network_conversation_read(uuid),
  public.report_stage29_builder_network_user(uuid, text, text, uuid, uuid, uuid),
  public.get_stage29_builder_world(integer),
  public.get_stage29_builder_network_conversations(),
  public.get_stage29_builder_network_conversation(uuid),
  public.get_stage29_school_network_settings(uuid),
  public.set_stage29_school_network_settings(uuid, boolean, boolean, boolean)
from public, anon;

grant execute on function public.join_stage29_builder_network(text),
  public.withdraw_stage29_builder_network(),
  public.create_stage29_builder_network_post(text, text, uuid),
  public.delete_stage29_builder_network_post(uuid),
  public.add_stage29_builder_network_comment(uuid, text),
  public.set_stage29_builder_network_reaction(uuid, text),
  public.send_stage29_builder_network_connection_request(uuid),
  public.respond_stage29_builder_network_connection(uuid, boolean),
  public.close_stage29_builder_network_connection(uuid, text),
  public.block_stage29_builder_network_user(uuid),
  public.start_stage29_builder_network_conversation(uuid),
  public.send_stage29_builder_network_message(uuid, text),
  public.mark_stage29_builder_network_conversation_read(uuid),
  public.report_stage29_builder_network_user(uuid, text, text, uuid, uuid, uuid),
  public.get_stage29_builder_world(integer),
  public.get_stage29_builder_network_conversations(),
  public.get_stage29_builder_network_conversation(uuid),
  public.get_stage29_school_network_settings(uuid),
  public.set_stage29_school_network_settings(uuid, boolean, boolean, boolean)
to authenticated;
