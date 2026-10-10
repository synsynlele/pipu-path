# PipuPath Google Play release foundation

Date: 9 October 2026. Baseline: `19509ee` on `main`.
Status: preview deployed; database migration applied; not store-ready.

Owner-confirmed privacy contact: `copyartint@gmail.com`. This is the public
fallback contact and may be overridden by server configuration. Online request
enablement still requires explicit configuration and the staging/operations gates.

Remote checks (updated 9 October): access restored to the PipuPath Vercel
project and Supabase project `kvjcswnmhwegpakbtvlh` (named pipupath-staging).
GitHub CI #1317 passed on `a01bbd2`; its exact Vercel preview is READY.
The preview /account-deletion route returned HTTP 200 with the owner contact
and sign-in/recovery links. PRIVACY_CONTACT_EMAIL is configured for preview
and production; existing deployments do not retroactively pick up env changes.

Applied play_account_deletion_requests to that Supabase project. Catalog
verification confirmed RLS enabled, no anonymous/authenticated read or insert
access, and service CRUD access. Two remote pgTAP assertions confirmed
anonymous and authenticated direct CRUD privileges are denied. The full
nine-test script executed but the connector exposed only its ninth assertion;
do not count the invisible results as verified. A separate rollback lifecycle
attempt returned an expired request-state connector error; a later count
confirmed zero request rows. Signed-in browser and actual fulfilment tests
remain pending. No users were deleted. Requests remain disabled.

Android inspection: manifest is version 1.0.2, code 3; no Console comparison
is available. Manual production-workflow runs now default to publish=false: signed artifacts
are uploaded without committing APK downloads. Explicit publish=true or the
existing RELEASE_NOW push trigger enables publication. No workflow-dispatch tool,
Docker runtime, Android SDK/device, or signed artifact is available in this
workspace. AAB/SDK/signature and device verification remain pending.

Security advisor review: the request queue has the expected informational
RLS-without-policy notice because direct client access is deliberately denied.
Existing SECURITY DEFINER execution warnings require function-by-function
review; they are not proof of an exploitable issue. Leaked-password protection
is reported disabled; see https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

Local validation: `npm run validate` passed (371 unit/coverage tests, 242
integration tests, formatting, zero-warning lint, TypeScript and production
build). Coverage thresholds passed. Thirteen PostgreSQL checks in PGlite passed
for migration execution, direct-client denial, service access, duplicate request
constraints, truthful fulfilment timestamps and retained receipt after auth-user
removal. Workflow YAML parsed and its Android build shell passed `bash -n`.
Remote pgTAP evidence and its result-visibility limitation are recorded above.

## Delivery decision

Keep the existing TWA, package `ng.name.pipupath.lite`, five destinations and
single developmental engine. No parallel native rewrite. The Android release
workflow already produces APK and AAB artifacts. SDK checks now inspect the
built APK; the actual AAB and Play-delivered install remain separate gates.

## Implemented in this candidate

- `/account-deletion`: accessible from a browser without reinstalling the app;
  linked from Profile and the public footer. Supports authenticated, verified
  requests without requiring completed onboarding. Recovery and a configured
  monitored contact support users who cannot sign in.
- Durable, idempotent deletion-request queue. No direct anonymous or
  authenticated table grants. Server actions derive the account from verified
  authentication, never a submitted target ID.
- `/admin/privacy`: owner/operator queue, oldest first, with a guarded review
  transition. Analysts/moderators cannot read or claim this queue.
- Requests are explicitly distinguished from actual deletion. No purge action
  or misleading completion button is included.
- Privacy disclosure now names the active OpenAI integration and core vendors.
  Formal policy approval remains pending; no legal approval is implied.
- Home labels journey position by stage, rather than presenting that position
  as a measured growth percentage. Build uses action-oriented copy.
- Storage failures in optional analytics cannot throw into the Builder UI.
- Android trust verification permits additional verified Play signing
  certificates while requiring the existing direct-download certificate.

## Enablement gates

1. Apply the migration in an authorised staging environment and regenerate
   Supabase types. Run database RLS tests against staging/local Supabase.
2. Configure `PRIVACY_CONTACT_EMAIL` with a real monitored KAEC-NG address.
   Assign a named operator and backup; do not route every request to the founder.
3. Exercise the deletion fulfilment runbook below on a disposable staging
   account. Confirm relational data, file storage, public proof, Passport shares,
   sessions and retained records are handled. Verify the result, not just auth
   account removal.
4. Approve and publish the actual retention schedule, privacy policy and Terms,
   including operator contact details, purpose, sharing, age/guardian handling
   and retained-data categories/durations. Existing MVP notices are not final.
5. Only then set `PRIVACY_REQUESTS_ENABLED=true`. Both enablement and a valid
   contact are required; requests fail closed when persistence is unavailable.

## Operator fulfilment runbook

Owner: authorised platform operator; backup: another authorised operator.
Input: saved request ID and authenticated account ID, or ownership-verified
external request received through the privacy contact.

1. Start review in Mission Control and identify the account using authorised
   tooling. For an external/guardian request verify authority privately without
   collecting unnecessary identity documents. Do not rely on an email address
   supplied by a stranger as proof of ownership.
2. Acknowledge receipt through the monitored contact. No automatic email send
   is implemented in this candidate. Give the requester an accurate processing
   expectation under the approved policy.
3. Inventory all associated records and storage objects, private evidence,
   published Portfolio proof, Passport links and cross-user contributions.
   Explain any legally required exceptions and their actual retention period.
4. Revoke sessions and withdraw public access before destructive processing.
   Follow the approved deletion procedure in authorised operations tooling.
   Deleting the auth user alone is not proof that every associated object was
   removed. Safeguarding holds require a documented, access-restricted exception.
5. Verify deletion and public-link withdrawal. Record completion and minimal
   permitted receipt evidence, then mark the request fulfilled with a completion
   timestamp through authorised service tooling. Never mark fulfilled first.
6. Confirm the outcome to the requester. Retain the minimal receipt only for
   the approved duration, then remove it. This schedule is a release gate.

Escalation: operator backup for unhandled requests; owner for a legal or
safeguarding exception. A founder approval is not the normal processing step.

## Play Console gates

- Confirm the existing account is the intended KAEC-NG organisation account
  and its identity verification is complete. No Console access was inspected.
- Keep production signing secrets outside Git. Decide signing compatibility
  for existing APK users before enrolling the package in Play signing.
- Register actual Play installed-app certificate fingerprints in Asset Links.
  Do not guess fingerprints or substitute upload-key certificates.
- Verify version code exceeds the highest already uploaded code; repository
  version metadata alone cannot establish the Console's latest value.
- Inspect target SDK in the actual AAB and run the Play pre-launch report.
- Upload accurate Data safety, target-age/Families declarations, content rating,
  support details, final privacy URL and `/account-deletion` web URL.
- Provide controlled reviewer access that can demonstrate the real app.
- Internal testing: sign-in/recovery, onboarding, first mission, Quest start,
  proof, reflection, project, safe Connect, blocking/reporting, deletion request,
  session expiry, Android Back and upgrades from existing installs.
- Test narrow screens, larger text, reduced motion, poor connectivity,
  low-memory Android, repeated background/resume and saved-work recovery.
- No authenticated browser, physical Android, production database, signed build
  or Play submission proof is claimed by local static validation.

## Impact pilot

An institution facilitator runs the same weekly cycle: choose a meaningful
challenge, act outside the app, submit proof, reflect, choose the next action.
Track time to the first useful action, evidence-backed completion, reflection
quality, project milestones and return-to-action. Existing funnel data is a
starting point; page views and XP alone do not establish developmental impact.

Use pilot observation to simplify onboarding and repeated screens. Do not
remove the evidence, reflection or safeguarding engine to shorten the funnel.
