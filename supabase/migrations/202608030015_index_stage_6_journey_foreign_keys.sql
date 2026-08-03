-- Cover Stage 6 ownership and replacement foreign keys used by RLS and lifecycle queries.
create index journey_requests_mission_idx
  on public.journey_generation_requests (mission_id, created_at desc);
create index journey_requests_source_idx
  on public.journey_generation_requests (source_journey_id)
  where source_journey_id is not null;
create index user_journeys_user_status_idx
  on public.user_journeys (user_id, status, created_at desc);
create index user_journeys_replaces_idx
  on public.user_journeys (replaces_journey_id)
  where replaces_journey_id is not null;
