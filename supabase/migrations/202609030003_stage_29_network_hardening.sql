-- Stage 29 release hardening.
-- Enforces social write limits in PostgreSQL, validates safety-report context,
-- and fixes full visible comment totals without weakening the controlled-RPC model.

create index if not exists builder_network_posts_author_created_idx
  on public.builder_network_posts(author_id, created_at desc);
create index if not exists builder_network_comments_author_created_idx
  on public.builder_network_comments(author_id, created_at desc);
create index if not exists builder_network_messages_sender_created_idx
  on public.builder_network_messages(sender_id, created_at desc);
create index if not exists builder_network_reports_reporter_created_idx
  on public.builder_network_reports(reporter_id, created_at desc);

create or replace function private.stage29_assert_write_rate_limit(
  actor_id_input uuid,
  action_input text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  short_count integer := 0;
  daily_count integer := 0;
begin
  if actor_id_input is null then
    raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  if action_input = 'post' then
    select count(*)::integer into short_count
    from public.builder_network_posts
    where author_id = actor_id_input and created_at >= now() - interval '10 minutes';
    select count(*)::integer into daily_count
    from public.builder_network_posts
    where author_id = actor_id_input and created_at >= now() - interval '24 hours';
    if short_count >= 5 or daily_count >= 30 then
      raise exception 'BUILDER_NETWORK_RATE_LIMITED' using errcode = 'P0001';
    end if;
  elsif action_input = 'comment' then
    select count(*)::integer into short_count
    from public.builder_network_comments
    where author_id = actor_id_input and created_at >= now() - interval '10 minutes';
    select count(*)::integer into daily_count
    from public.builder_network_comments
    where author_id = actor_id_input and created_at >= now() - interval '24 hours';
    if short_count >= 15 or daily_count >= 120 then
      raise exception 'BUILDER_NETWORK_RATE_LIMITED' using errcode = 'P0001';
    end if;
  elsif action_input = 'message' then
    select count(*)::integer into short_count
    from public.builder_network_messages
    where sender_id = actor_id_input and created_at >= now() - interval '10 minutes';
    select count(*)::integer into daily_count
    from public.builder_network_messages
    where sender_id = actor_id_input and created_at >= now() - interval '24 hours';
    if short_count >= 40 or daily_count >= 500 then
      raise exception 'BUILDER_NETWORK_RATE_LIMITED' using errcode = 'P0001';
    end if;
  elsif action_input = 'report' then
    select count(*)::integer into short_count
    from public.builder_network_reports
    where reporter_id = actor_id_input and created_at >= now() - interval '1 hour';
    if short_count >= 20 then
      raise exception 'BUILDER_NETWORK_RATE_LIMITED' using errcode = 'P0001';
    end if;
  else
    raise exception 'BUILDER_NETWORK_ACTION_INVALID' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function private.stage29_assert_write_rate_limit(uuid, text)
from public, anon, authenticated;

alter function public.create_stage29_builder_network_post(text, text, uuid)
  rename to create_stage29_builder_network_post_base;
revoke all on function public.create_stage29_builder_network_post_base(text, text, uuid)
from public, anon, authenticated;

create or replace function public.create_stage29_builder_network_post(
  kind_input text,
  body_input text,
  project_id_input uuid default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then
    raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001';
  end if;
  perform private.stage29_assert_write_rate_limit(actor, 'post');
  return public.create_stage29_builder_network_post_base(
    kind_input, body_input, project_id_input
  );
end;
$$;
revoke all on function public.create_stage29_builder_network_post(text, text, uuid)
from public, anon;
grant execute on function public.create_stage29_builder_network_post(text, text, uuid)
to authenticated;

alter function public.add_stage29_builder_network_comment(uuid, text)
  rename to add_stage29_builder_network_comment_base;
revoke all on function public.add_stage29_builder_network_comment_base(uuid, text)
from public, anon, authenticated;

create or replace function public.add_stage29_builder_network_comment(
  post_id_input uuid,
  body_input text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then
    raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001';
  end if;
  perform private.stage29_assert_write_rate_limit(actor, 'comment');
  return public.add_stage29_builder_network_comment_base(post_id_input, body_input);
end;
$$;
revoke all on function public.add_stage29_builder_network_comment(uuid, text)
from public, anon;
grant execute on function public.add_stage29_builder_network_comment(uuid, text)
to authenticated;

alter function public.send_stage29_builder_network_message(uuid, text)
  rename to send_stage29_builder_network_message_base;
revoke all on function public.send_stage29_builder_network_message_base(uuid, text)
from public, anon, authenticated;

create or replace function public.send_stage29_builder_network_message(
  conversation_id_input uuid,
  body_input text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then
    raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001';
  end if;
  perform private.stage29_assert_write_rate_limit(actor, 'message');
  return public.send_stage29_builder_network_message_base(
    conversation_id_input, body_input
  );
end;
$$;
revoke all on function public.send_stage29_builder_network_message(uuid, text)
from public, anon;
grant execute on function public.send_stage29_builder_network_message(uuid, text)
to authenticated;

alter function public.report_stage29_builder_network_user(uuid, text, text, uuid, uuid, uuid)
  rename to report_stage29_builder_network_user_base;
revoke all on function public.report_stage29_builder_network_user_base(uuid, text, text, uuid, uuid, uuid)
from public, anon, authenticated;

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
declare actor uuid := auth.uid();
begin
  if actor is null then
    raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001';
  end if;
  if actor = target_user_id_input then
    raise exception 'BUILDER_NETWORK_ACTION_INVALID' using errcode = 'P0001';
  end if;
  if num_nonnulls(post_id_input, comment_id_input, message_id_input) > 1 then
    raise exception 'BUILDER_NETWORK_REPORT_CONTEXT_INVALID' using errcode = 'P0001';
  end if;

  if post_id_input is not null then
    if not exists (
      select 1
      from public.builder_network_posts post
      where post.id = post_id_input
        and post.author_id = target_user_id_input
        and post.status = 'published'
        and private.stage29_pair_visible(actor, post.author_id)
    ) then
      raise exception 'BUILDER_NETWORK_REPORT_CONTEXT_INVALID' using errcode = 'P0001';
    end if;
  elsif comment_id_input is not null then
    if not exists (
      select 1
      from public.builder_network_comments comment
      join public.builder_network_posts post on post.id = comment.post_id
      where comment.id = comment_id_input
        and comment.author_id = target_user_id_input
        and comment.status = 'published'
        and post.status = 'published'
        and private.stage29_pair_visible(actor, comment.author_id)
        and private.stage29_pair_visible(actor, post.author_id)
    ) then
      raise exception 'BUILDER_NETWORK_REPORT_CONTEXT_INVALID' using errcode = 'P0001';
    end if;
  elsif message_id_input is not null then
    if not exists (
      select 1
      from public.builder_network_messages message
      join public.builder_network_conversations conversation
        on conversation.id = message.conversation_id
      where message.id = message_id_input
        and message.sender_id = target_user_id_input
        and message.status = 'sent'
        and actor in (conversation.participant_a, conversation.participant_b)
    ) then
      raise exception 'BUILDER_NETWORK_REPORT_CONTEXT_INVALID' using errcode = 'P0001';
    end if;
  elsif not private.stage29_pair_visible(actor, target_user_id_input)
    and not exists (
      select 1
      from public.builder_connections connection
      where least(connection.requester_id, connection.recipient_id) = least(actor, target_user_id_input)
        and greatest(connection.requester_id, connection.recipient_id) = greatest(actor, target_user_id_input)
    ) then
    raise exception 'BUILDER_NETWORK_REPORT_CONTEXT_INVALID' using errcode = 'P0001';
  end if;

  perform private.stage29_assert_write_rate_limit(actor, 'report');
  return public.report_stage29_builder_network_user_base(
    target_user_id_input,
    reason_code_input,
    detail_input,
    post_id_input,
    comment_id_input,
    message_id_input
  );
end;
$$;
revoke all on function public.report_stage29_builder_network_user(uuid, text, text, uuid, uuid, uuid)
from public, anon;
grant execute on function public.report_stage29_builder_network_user(uuid, text, text, uuid, uuid, uuid)
to authenticated;

create or replace function private.stage29_visible_comment_count(
  post_id_input uuid,
  viewer_id_input uuid
) returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.builder_network_comments comment
  where comment.post_id = post_id_input
    and comment.status = 'published'
    and private.stage29_pair_visible(viewer_id_input, comment.author_id);
$$;
revoke all on function private.stage29_visible_comment_count(uuid, uuid)
from public, anon, authenticated;

alter function public.get_stage29_builder_world(integer)
  rename to get_stage29_builder_world_base;
revoke all on function public.get_stage29_builder_world_base(integer)
from public, anon, authenticated;

create or replace function public.get_stage29_builder_world(limit_input integer default 24)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  base_state jsonb;
  patched_feed jsonb := '[]'::jsonb;
begin
  if actor is null then
    raise exception 'BUILDER_NETWORK_AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  base_state := public.get_stage29_builder_world_base(limit_input);
  select coalesce(
    jsonb_agg(
      jsonb_set(
        feed_item.item,
        '{commentCount}',
        to_jsonb(private.stage29_visible_comment_count((feed_item.item->>'id')::uuid, actor)),
        true
      )
      order by feed_item.ordinality
    ),
    '[]'::jsonb
  )
  into patched_feed
  from jsonb_array_elements(coalesce(base_state->'feed', '[]'::jsonb))
    with ordinality as feed_item(item, ordinality);

  return jsonb_set(base_state, '{feed}', patched_feed, true);
end;
$$;
revoke all on function public.get_stage29_builder_world(integer)
from public, anon;
grant execute on function public.get_stage29_builder_world(integer)
to authenticated;