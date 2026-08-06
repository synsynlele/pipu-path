-- Stage 11 enum extension is isolated because PostgreSQL requires a commit before the new value is used.
alter type public.journey_generation_kind add value if not exists 'continue';
