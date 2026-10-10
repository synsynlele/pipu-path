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
external Auth endpoint and actual Storage object deletion remain unverified.
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
to release evidence after a successful run. As of 10 October, it has not run
against external APIs: the workspace has no injected server credentials.

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
