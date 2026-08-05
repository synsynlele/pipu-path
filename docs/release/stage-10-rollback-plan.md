# Stage 10 rollback plan

1. Do not promote Stage 10 until the exact Preview and staging matrix pass.
2. Preserve Stage 9 head `9d0071273654a89d14fe6f60b03a13dc65532ba1`
   as the known-good application rollback point.
3. If a promoted release fails, immediately restore the previous Vercel
   production deployment rather than patching production in place.
4. Migration `020` adds an isolated authentication rate-limit table and function.
   The application can be rolled back to Stage 9 without reading them; do not
   destructively remove the table during an incident.
5. Disable or revert only the affected environment change when the incident is
   configuration-related. Environment changes require a new deployment.
6. Reproduce the failure on Preview, correct it in a new commit and rerun the
   complete release checklist before re-promotion.
7. Record the incident, affected head/deployment, user impact and recovery proof.
