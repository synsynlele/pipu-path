# Release closure — 10 October 2026

Status: candidate validated; founder-operated pilot preparation authorised;
public release not cleared. This record replaces
fragmented progress updates as the operator handover.

## Completed evidence

- Short Discovery: eight questions per age band, seven required; owner reports
  successful onboarding.
- Focused Quest instructions and sequential reflection, including Back-state
  preservation, implemented and covered by local tests.
- Session-cookie preservation on authentication redirects corrected and tested.
- Real disposable Auth/Storage deletion proof passed; no existing user targeted.
- Previously issued 10-minute signed file link failed at the origin after deletion,
  while its token was still valid; fresh-origin signed-link proof passed.
- Approved 7-day acknowledgement / 30-day service target / 90-day receipt schedule.
- Daily verified-receipt cleanup active at 03:10 UTC; rollback exclusions verified.
- Candidate operator queue has deadline/escalation guidance and reviewed retry / backup handover.
- Standard validation: 424 unit/component and 242 integration tests; production build.
- Existing Android AAB inspected: 1.0.2, version code 3, SDK 36. This signed
  artifact predates the latest interface and is not the final tested candidate.

## Provider inventory — verified facts and limits

| Provider    | Verified fact                                                                                                                | Remaining evidence                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Supabase    | Connected project kvjcswnmhwegpakbtvlh, healthy, EU West region; used for Auth/database/files; real fixture erasure verified | Actual plan, backup/PITR retention, exports, deletion reconciliation after restore                 |
| Vercel      | Connected project prj_EijX6BCMKdWZTMCJDMevLFj1TjmK hosts the candidate; secrets are protected                                | Actual log duration, log drains, error-reporting retention and access                              |
| OpenAI      | Code calls Responses API with store:false; existing adapter regression test checks this                                      | Organisation controls, abuse-log retention/exceptions and any other API/application-state features |
| Browser/CDN | Origin verification avoids warmed cache responses using cacheNonce                                                           | Cache propagation and copies already downloaded cannot be represented as immediate erasure         |

Project-health metadata does not reveal a backup retention window. A protected
secret or a successful build does not verify provider data controls. No Zero Data
Retention claim is made. Source: src/lib/ai/openai-structured-output.ts.

## Work needed before public release

| Gate                      | Accountable role                                    | Required completion evidence                                                                                                                   |
| ------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Guardian authorisation    | Product/engineering + safeguarding/privacy reviewer | Verified guardian authority/consent flow and child AI/onboarding review; not a child checkbox or a guardian_required declined record           |
| Privacy operations backup | Platform owner                                      | Owner waived backup handover as blocker; founder operates meanwhile; Adewale practical handover remains follow-up                              |
| Provider retention        | Server-secret / infrastructure custodian            | Record actual dashboard settings and exported-copy locations; approve restore reconciliation and publish accurate notice                       |
| Hosted Google Auth        | Auth configuration custodian                        | PASS: owner reported redirect added; actual Google return to reviewed preview and Quest/Home reload persistence observed on 10 October         |
| Browser lifecycle         | QA operator                                         | Fresh authorised fixture: login, action, evidence, reflection Back-state, exactly-once XP, next unlock and failure recovery on exact candidate |
| Android                   | QA operator with phone/tablet                       | Latest candidate: login return, narrow screens, navigation, proof, resume after idle, no renderer crash; capture real screenshots              |
| Play submission           | Console owner/release operator                      | Final signed candidate, accurate audience/Data safety/privacy/app access, internal test evidence, then review                                  |

Connect is currently adult-only and minors cannot publish public Portfolio proof.
These safeguards do not replace lawful child account/AI authorisation. The product
continues to target young people; no adult-only release decision has been made.
Do not change audience declarations just to bypass incomplete child safeguards.

Google Play Console browser access was rejected by automatic approval review.
No app listing, upload or submission was completed. The Console owner must use
its normal trusted session for the eventual submission; do not retry through a
blocked route or alternate automation technique.

## Named responsibility — 10 October 2026

The owner nominated Oluwatosin Adebayo as the guardian reviewer. This records
responsibility for reviewing guardian requests and the proposed child consent
flow; it does not establish guardian authority for any learner or complete the
required authorisation workflow.

The supplied account, copyartint@gmail.com, is verified and already has an active
owner role. No role change was needed or made. The owner subsequently identified Adewale Ayanfe as the distinct person handling
the verified company account kaecng@gmail.com. That account now has the active
existing platform operator role, granted under the owner nomination with a
database audit event. Backup responsibility is assigned; the owner subsequently reported successful sign-in and Mission Control access.
The controlled operational drill was paused after email-login failure: both
operator accounts are Google-only without passwords. Actual Google preview
return and Quest/Home reload persistence passed on 10 October; human operator
takeover is deferred by explicit owner decision. See
docs/release/privacy-operator-handover.md. This role includes existing platform
operator permissions, not a new privacy-only permission set.

## Execution handover

Use docs/release/account-deletion-operations.md for privacy execution and
recovery. Review the oldest open cases weekly and escalate held/failed cases to
named reviewers. Inspect Cron history and expired-receipt backlog. Keep request
and fulfilment flags disabled until activation gates are complete. No automatic
acknowledgement email or guardian verification is claimed.

The owner explicitly accepted interim routine operations while backup handover
is deferred. This is a temporary operating dependency, not completed delegation.
Use docs/release/founder-operated-pilot.md to capture repeated issues and reduce
founder involvement as verified operator coverage grows. Founder involvement in
the mature system is limited to assigning accountable people and approving
material policy changes. Routine verification uses the same repeatable test and
recorded evidence at every release. This supports growth without relying on the
founder as the testing or deletion operator.

## Browser runner limitation

`tests/e2e/release-login.spec.ts` now explicitly checks password sign-in, Home
session persistence across reload and narrow Discovery without horizontal
overflow. It is prepared, not browser-proven. The local Playwright Chromium
installer returned zero-size/invalid archives and failed; no browser regression
pass is claimed. Configure a working QA runner and disposable fixture using the
existing global setup, then run:

`npx playwright test tests/e2e/release-login.spec.ts --project=chromium`

This check does not replace actual Google OAuth, the full Quest lifecycle or
physical Android tests. Do not promote an existing learner account into QA
without explicit authorisation.

## Observed browser navigation — 10 October

On candidate da6cfed1ec0f9f7986127f7060118480a0c968c9, Google device approval
returned to the reviewed preview Quest page. Quest and Home survived reload
with the owner session. Next/Previous action controls changed the visible
instruction; Prove opened the private evidence form and Back returned to Act.
No proof/reflection was submitted or XP awarded by this check. Full mutation
lifecycle remains pending a disposable QA account.
