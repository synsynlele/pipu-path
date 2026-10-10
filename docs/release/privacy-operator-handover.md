# Privacy operator handover drill

## People and access

Owner / nominated guardian reviewer: Oluwatosin Adebayo, copyartint@gmail.com.
Backup: Adewale Ayanfe, company account kaecng@gmail.com. Owner confirmed a
separate handler. Active operator grant and audit event verified; on 10 October
the owner reported Adewale signed in and Mission Control opened. This is
owner-reported UI evidence, not an independently observed browser run.

## Controlled candidate

The preview shares the live backend. Only a newly provisioned disposable adult
fixture and its pending request are permitted for this drill. Server-only
PRIVACY_DRILL_MODE=true requires VERCEL_ENV=preview, valid
PRIVACY_DRILL_REQUEST_ID and PRIVACY_DRILL_USER_ID. Queue and inventory are
restricted to that request. Other submissions, reviews, takeovers and worker
requests are denied; mismatched worker target is refused before Auth suspension
or file/data removal. Production flags stay disabled.

Provision with scripts/privacy-handover-fixture.mjs and securely injected existing
server credentials plus PRIVACY_HANDOVER=create-fixture. It accepts no target
account ID, creates its own adult fixture, harmless image and pending request.
No login password is retained and no email is sent. This seeds the request for
the drill; it does not prove the customer request-submission UI.

Configure the five drill/request/fulfilment variables only on the reviewed preview
branch. Also set PRIVACY_REQUESTS_ENABLED=true and PRIVACY_FULFILMENT_ENABLED=true.
Never apply those switches globally or to production. Keep one designated request
per drill. Require actual verified owner/operator login; no bypass credentials.

## Human drill

1. Owner signs into the exact preview and opens /admin/privacy. Match its request
   ID to the designated fixture; open Read-only inventory and check one owned file.
2. Owner selects Start review, then leaves it unfinished and signs out.
3. Adewale signs in with the company account in a separate browser profile or
   after sign-out. Open the same preview /admin/privacy and Take over review.
4. Explain ownership verification and approved 7-day acknowledgement / 30-day
   service target. No acknowledgement email is sent automatically. This fixture
   was deliberately provisioned; real cases require actual ownership evidence.
5. Discuss a disputed guardian request or safeguarding hold verbally. Pause and
   escalate to the named reviewer; do not fabricate a real safeguarding record
   or bypass a hold just to complete training.
6. With no unresolved holds, enter the exact request ID, select the review
   confirmation and Permanently process deletion. Record the response.
7. Engineering verifies Auth missing, profile/file absence, fulfilled request,
   verified job and cleared target identity through the existing real APIs. A
   disappearing open-queue row alone does not prove deletion completion.
8. Disable the preview request/fulfilment switches and remove the drill deployment
   after the drill. Existing deployments retain their environment snapshot;
   changing project variables alone does not disable an already built deployment. Preserve
   minimal receipt evidence under the approved 90-day schedule. Record exact
   deployment, operator, date, outcome and any exceptions.

No operator competence, human takeover or completion is claimed before these
steps are observed or reported with evidence. Provider/guardian and other release
gates remain independent. Do not retry a failed partial run on a new request or
mark it fulfilled manually; resolve and retry the same request.

## Provisioned drill record — 10 October 2026

Disposable adult account: bc5c55d2-3955-4f35-b03a-4841be50889d.
Designated pending request: 90bf9f41-8a9d-44af-bc29-d54c1404e236.
One harmless PNG is owned by that account. No learner account was targeted.
Five configuration values are scoped to preview branch
agent/life-game-first-cycle only. No production or global preview activation.
Local validation passed: 424 unit/component and 242 integration tests, lint,
types, formatting, coverage and production build. Human practice is pending.

## Ready preview and validation evidence

Exact drill deployment: dpl_3miwTYw4phUGcmgAFvhPuudzTTY4, READY, preview target.
URL: https://pipu-path-cotckwv45-copyartint-2860s-projects.vercel.app
Code commit: 16a36927236897b4f873df4f0d592ed5f755b5c8.
GitHub CI 1341 (38052727608): validate succeeded; staging-e2e skipped.
Unauthenticated deployment fetch responded successfully; no authenticated web
action is claimed. Preflight confirms adult fixture, existing account and one
storage object; request remains pending. Use email/password on this exact
preview: Google callback preview preservation is still unresolved.
