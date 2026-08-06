# Stage 11 rollback plan

Stage 11 database changes are additive. Application rollback therefore does not
require destructive schema rollback.

## Application rollback

1. Re-point production to the last verified Stage 10 deployment.
2. Confirm `/`, authentication, `/app`, Journey, Build, Portfolio and Profile.
3. Keep Stage 11 tables and functions dormant while the prior application runs.

## Containment

If Connect behavior is unsafe without rolling back the application:

1. Set all `builder_connect_profiles.visibility` values to `private` through an
   authorised administrative operation.
2. Revoke authenticated execution on Stage 11 Connect RPCs.
3. Preserve reports, blocks and connection records for investigation.

If Journey continuation is faulty, revoke execution on the Stage 11 replacement
Journey request RPC and restore the prior function definition through a forward
migration. Existing completed Journeys and Projects remain intact.

## Data rule

Do not drop Stage 11 tables or delete reports, blocks, consent or relationship
records during incident response. Corrective database work must be a reviewed
forward migration.
