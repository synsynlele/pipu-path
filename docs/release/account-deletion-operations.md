# Account deletion operations

Status: implemented candidate; production processing remains disabled.
Owner: authorised privacy operator. Backup: another owner/operator.

## Activation gates

Apply fulfilment, review-handover and schema-guard migrations. Approve retention, exceptions
and child/guardian ownership procedures. Verify actual Storage and Auth Admin
APIs on a designated disposable account. Database-only fixtures and mocked
adapters do not replace that external API proof.

The action requires `PRIVACY_REQUESTS_ENABLED=true` and
`PRIVACY_FULFILMENT_ENABLED=true`. Neither flag was enabled by this change.
Keep the contact monitored and the privacy notice accurate. Do not promise
immediate deletion, a retention period or backup erasure that has not been
approved and implemented.

## Operator procedure

1. Open `/admin/privacy`, start review and verify ownership. Inspect dependencies,
   shared records and any required retention. Follow the approved external or
   guardian procedure when the requester cannot authenticate.
2. Resolve holds. Automatic processing refuses administrators, safeguarding
   reports, organisational attribution and certain verifier roles. These need
   a separate approved transfer, retention or deletion plan.
3. Explain shared-record deletion and approved provider/backup retention. Confirm
   that no unresolved hold remains, type the request ID and select Permanently
   process deletion.
4. The worker suspends login, purges linked records in one database statement,
   removes files through Storage API, deletes Auth and verifies absence before
   fulfilling the request. Functions are service-only; the action uses the
   verified operator session rather than a form-supplied operator ID.
5. Confirm the outcome through the monitored contact. Automatic email is not
   implemented. Follow the approved receipt retention and cleanup schedule.

## Failure and backup handling

The queue displays durable state, phase and attempts. A failed run may already
have suspended login or removed some data. Do not report completion or manually
mark it fulfilled. Resolve the failure and retry the same request. More than
2,000 files may require another bounded run. Files are re-enumerated; an Auth
404 is accepted only after database purge and storage checks.

Active leases last ten minutes and renew at database/storage checkpoints. A
second worker cannot claim one. A backup can Take over review only when no active
lease exists, review the case and resume. The former reviewer then loses
processing authority. Wait for lease expiry after a disconnected worker; do not
disable the lease to force concurrent execution.

Completion clears the job's target account ID; the Auth FK clears the requester
ID. Minimal receipts and operator attribution remain under the approved schedule.
Provider logs and backups are outside this executor; their retention needs
separate disclosure and verification.

## Scope and verification

The purge covers direct Auth/Profile FKs, named private insight child tables and
Passport access events. It handles restrictive cycles in one statement without
disabling constraints or triggers. Unexpected cross-account restrictions roll
the database purge back. Existing cascade rules may remove shared conversations
and collaborations; operator confirmation explains this.

A restrictive Storage policy denies evidence access/upload after the profile
is absent, including a stale JWT. Storage metadata is enumerated read-only;
files are removed through Storage API. Final verification checks Auth absence,
owned Storage metadata and direct identity dependencies, then updates the request
and job atomically. It does not certify external logs, backups or unlinked
future fields as erased.

`scripts/sql/verify-account-deletion.sql` creates disposable Auth, interpretation,
profile, cyclic Mission/Journey and Passport fixtures, then rolls everything back.
It passed on the connected database: report holds, role denial, exclusive leases,
premature-completion denial, retry after Auth removal, backup takeover and
unrelated-account preservation. Auth removal there is simulated in SQL; the
external APIs are verified separately by the live proof below.
Adapter tests cover success and failures at each processing boundary.

Review the schema map whenever data-bearing tables or providers change. Free
text in somebody else's records, provider logs and backups require a policy-aware
review; an FK inventory is not universal personal-data discovery.

## Schema and operator safeguards

Processing checks the reviewed public FK graph before claiming, purging,
listing files or completing a job. Changed relationships stop processing until
the erasure map is reviewed and its fingerprint updated by an engineering
migration. Do not update the fingerprint merely to bypass a failure. Changes
to unlinked fields, free text and providers still need manual privacy review.

Processing checkpoints also recheck the current operator role. Revocation stops
the next database/storage checkpoint, preserves the incomplete job and permits
an authorised backup to review and retry. The rollback fixture verified that a
revoked operator cannot purge data.

## Repeatable external API proof

Run `npx vitest run --config vitest.privacy-live.config.ts` in an authorised
server environment with the Supabase URL, publishable/anon key and server-only
service key injected securely. Also set `PRIVACY_TEST_PROJECT_REF` to the exact
project reference, `PRIVACY_TEST_OPERATOR_ID` to an existing verified active
owner/operator, and `PRIVACY_LIVE_TEST=create-and-delete-fixture`. Never paste
keys into chat or commit them. The project reference must match the API host.

The dedicated test is excluded from ordinary CI. It creates its own confirmed
fixture account, proves password login, uploads and downloads a real tiny image,
then calls the actual `runDeletionJob` adapter. It verifies missing Auth, missing
file, missing profile, cleared target identity, fulfilled receipt, rejected login
and preservation of the operator. It accepts no existing target account ID.
Successful fixture receipts are cleaned up. Failed fixtures print only IDs for
operator recovery and retain incomplete-job evidence; do not manually fulfil them.

This proof bypasses the web action and does not enable production flags. It does
not prove browser confirmation, guardian policy, public links, provider retention
or erasure from backups. Add the exact commit, project, run result and reviewer
to release evidence after a successful run. On 10 October, the owner supplied the credentials file. The fresh-origin live
proof passed against the connected project; no keys were printed or committed.

## GitHub operator execution

The manual `Disposable account deletion proof` workflow uses the dedicated
`privacy-verification` GitHub environment. It has no push, pull-request or
scheduled trigger; jobs are serialised without cancelling an active deletion.
Only a commit matching the environment variable `PRIVACY_REVIEWED_SHA` may run.
The environment should restrict deployment branches to the reviewed release
branch. Do not run arbitrary branch code with these secrets.

Configure these environment values through GitHub Settings → Environments →
privacy-verification. A release operator owns this configuration and execution;
credentials must come from the authorised server-secret custodian.

| Kind     | Name                                   | Value                                           |
| -------- | -------------------------------------- | ----------------------------------------------- |
| Variable | PRIVACY_REVIEWED_SHA                   | Full reviewed commit SHA selected for this test |
| Variable | PRIVACY_TEST_SUPABASE_URL              | Exact authorised Supabase HTTPS API URL         |
| Variable | PRIVACY_TEST_PROJECT_REF               | Reference matching that URL                     |
| Variable | PRIVACY_TEST_OPERATOR_ID               | Existing active verified owner/operator UUID    |
| Secret   | PRIVACY_TEST_SUPABASE_ANON_KEY         | Publishable/legacy anon key for fixture login   |
| Secret   | PRIVACY_TEST_SUPABASE_SERVICE_ROLE_KEY | Server-only key for the same project            |

Once the workflow is available in Actions, select the reviewed branch and run it
with `create-and-delete-fixture`. Record the run URL and exact SHA as evidence.
A green ordinary CI run is not a green deletion proof. The workflow is currently
published only on the candidate branch, not merged into the default branch, and
has not been dispatched. Protected Vercel secrets cannot be read back through
the connected environment API; no secret was extracted or reclassified.

## Storage cache verification

The first real fixture run removed Auth and Storage metadata and produced a
fulfilled receipt, but a warmed download still returned the tiny test image.
This failed the initial immediate-download assertion; it is not evidence that
the downloaded response vanished instantly. Supabase documents asynchronous
CDN invalidation (up to 60 seconds) and independent browser cache retention.
The live harness now uses a unique `cacheNonce` to verify absence at the origin.
Previously downloaded copies cannot be recalled. Do not promise instant global
cache erasure. Signed links, browser-cache behavior and approved retention
disclosure remain separate release checks.

Reference: https://supabase.com/docs/guides/storage/cdn/smart-cdn

## 10 October live proof result

The dedicated real-API test passed (one test, approximately 104 seconds) on
`kvjcswnmhwegpakbtvlh`. It verified newly created fixture login, real file upload
and download, actual worker execution, Auth 404, fresh-origin file denial,
profile absence, fulfilled request, verified job with target identity cleared,
login rejection and operator preservation. The successful fixture receipt was
removed. The earlier cache-assertion fixture receipt was also removed only after
confirming fulfilled state and cleared target identity; no fixture Auth accounts
remain. No existing account was targeted.

This is the API proof gate, not production activation. Requests and fulfilment
flags remain disabled. Retention/guardian approval, backup operator appointment,
web-action/browser checks, signed-link/cache checks and physical Android testing
remain pending. The uploaded credentials were injected into the test process;
no additional credential file was written into the repository. GitHub environment
secret configuration for repeat runs remains pending.

## Approved operating schedule and receipt expiry

The owner approved acknowledgement within 7 days, a 30-day completion service
target and 90-day minimal receipt retention on 10 October. These are operational
targets, not a claim of legal deadlines. The candidate queue shows deadline dates
and escalation text; it does not track or send acknowledgement emails. Operators
must record/send responses using the approved monitored-contact procedure.

`privacy-receipt-expiry` is active on the connected database at 03:10 UTC daily
(04:10 Lagos). It deletes up to 1,000 receipts per run only when both request and
job have been completed for more than 90 days, the job is verified, target/user
identity has cleared and there is no lease. Jobs are removed by the request FK
cascade. Pending, failed, processing, linked and recently completed cases remain.
The private function is unavailable to anon/authenticated clients. Rollback
fixtures verified expiry, exclusions and privileges without persistent test data.

Check Supabase Cron job history weekly for failures and expired-receipt backlog.
A failed cron does not guarantee timely expiry; resolve failures and rerun the
private function through authorised database operations. Never change the cutoff
or remove incomplete records to clear a backlog. No scheduler tick has yet been
observed; active schedule and function execution were verified separately.

Provider/backup durations, guardian controls, named backup and exception reviewers
remain activation gates. The public notice and deletion flags are unchanged.
