-- Cover Stage 11 foreign keys used by moderation, consent and cycle lineage.
create index if not exists builder_blocks_blocked_idx
  on public.builder_blocks(blocked_id);
create index if not exists builder_contact_shares_owner_idx
  on public.builder_contact_shares(owner_id);
create index if not exists builder_reports_reporter_idx
  on public.builder_reports(reporter_id);
create index if not exists journey_requests_continues_idx
  on public.journey_generation_requests(continues_journey_id)
  where continues_journey_id is not null;
create index if not exists user_journeys_continues_idx
  on public.user_journeys(continues_journey_id)
  where continues_journey_id is not null;
