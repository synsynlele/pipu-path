-- Stage 29 performance hardening.
-- Cover foreign-key lookup paths used by Builder Network moderation, discovery
-- and relationship maintenance without changing product behaviour.

create index if not exists builder_network_conversations_participant_b_idx
  on public.builder_network_conversations(participant_b);
create index if not exists builder_network_message_reads_user_idx
  on public.builder_network_message_reads(user_id);
create index if not exists builder_network_participation_school_workspace_idx
  on public.builder_network_participation(school_workspace_id)
  where school_workspace_id is not null;
create index if not exists builder_network_posts_project_idx
  on public.builder_network_posts(project_id)
  where project_id is not null;
create index if not exists builder_network_reactions_reactor_idx
  on public.builder_network_reactions(reactor_id);
create index if not exists builder_network_reports_target_user_idx
  on public.builder_network_reports(target_user_id);
create index if not exists builder_network_reports_post_idx
  on public.builder_network_reports(post_id)
  where post_id is not null;
create index if not exists builder_network_reports_comment_idx
  on public.builder_network_reports(comment_id)
  where comment_id is not null;
create index if not exists builder_network_reports_message_idx
  on public.builder_network_reports(message_id)
  where message_id is not null;
create index if not exists builder_network_school_settings_updated_by_idx
  on public.builder_network_school_settings(updated_by_user_id)
  where updated_by_user_id is not null;
