-- Stage 4 runtime repair: Supabase installs pgcrypto in the extensions schema.
-- Keep the function's locked search path while making digest resolution explicit
-- through the trusted extensions schema.

alter function public.normalize_stage4_discovery_evidence()
  set search_path = public, extensions;

Ÿ®8