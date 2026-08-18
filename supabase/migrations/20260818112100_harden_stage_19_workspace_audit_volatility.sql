-- Stage 19 hardening: the workspace read RPC records an audit event, so it
-- must be VOLATILE. PostgreSQL prohibits INSERT inside a STABLE function at runtime.

alter function public.get_stage19_institution_workspace(uuid, integer) volatile;
