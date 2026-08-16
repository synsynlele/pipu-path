-- Stage 14: allow the private Human Potential evidence graph to ingest
-- explicit user feedback and completed real-world Builder work.
--
-- Keep this enum extension in its own migration. PostgreSQL requires newly
-- added enum values to be committed before later migrations safely use them.

alter type public.hpi_evidence_source_type
  add value if not exists 'builder_project';

alter type public.hpi_evidence_source_type
  add value if not exists 'profile_feedback';
