-- Reviewed, vetted practical starters are a transparent and zero-AI-retry
-- fallback when model output fails validation. Prior attempts remain intact.
alter table public.real_build_templates
  drop constraint if exists real_build_templates_source_check;
alter table public.real_build_templates
  add constraint real_build_templates_source_check
  check (source in ('openai','reviewed'));

alter table public.real_build_attempts
  drop constraint if exists real_build_attempts_source_check;
alter table public.real_build_attempts
  add constraint real_build_attempts_source_check
  check (source in ('openai','reviewed'));
