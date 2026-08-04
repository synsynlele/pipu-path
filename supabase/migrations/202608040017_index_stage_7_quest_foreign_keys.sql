create index quest_requests_journey_idx
  on public.quest_generation_requests(journey_id);

create index user_quests_generation_request_idx
  on public.user_quests(generation_request_id);
