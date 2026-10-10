# Repeatable Quest release check

Owner: QA operator. Escalation: product/engineering for failures; privacy reviewer
for unintended evidence disclosure. Record candidate SHA and exact deployment,
device/browser, observed result and issue reference. A second operator must be
able to reproduce the result from this checklist.

## Prerequisites

Use a designated disposable QA account for mutations. Never use an existing
learner or owner record to invent action, proof, reflection or earned progress.
Sign in through the normal secure flow. Mark all fixture content as test data.

## Execution

1. Sign in; verify the return origin, authenticated Home and reload persistence.
2. Open the current Quest. Check Next/Previous and all-actions controls; reading
   instructions must not complete the Quest or award XP.
3. Open Prove. Confirm evidence is private by default and optional supporting
   link/image are clearly labelled. Check Back navigation.
4. On the disposable fixture only, submit clearly labelled test evidence; verify
   the stored record and transition to reflection, with no premature XP.
5. Complete each reflection prompt. Use Back and verify the previous answer is
   preserved; check that incomplete reflection cannot finish the Quest.
6. Finish once. Compare XP before/after with the Quest reward, verify one
   completion record and the next unlock. Reload/revisit must not duplicate XP.
7. Return Home; verify current mission/progress agrees with persisted records.
8. Repeat navigation and evidence/reflection on physical phone and tablet.
   Resume after idle; record layout, login return and any renderer crash.
9. File reproducible failures with stage/severity; recheck after the fix. Retire
   fixture data using the approved disposable-test cleanup procedure.

## Current evidence

Candidate da6cfed1ec0f9f7986127f7060118480a0c968c9: actual Google return,
Quest/Home session reload, action Next/Previous, Prove form and Back navigation
observed on 10 October 2026. Submission/reflection/XP/unlock mutation checks and
latest physical-device proof remain pending. Existing component/integration
tests are supporting evidence, not a replacement for these browser checks.

Aggregate repeated failures by stage in pilot-feedback-template.csv. One operator
can run the same release check for cohorts 100 times larger; participant volume
changes the feedback count, not the release procedure. Keep fixes and verification
evidence together so each release builds on the previous one.

## Reusable live API check

Supply existing approved Supabase URL/anon/service credentials through server
environment variables, never through committed files or command arguments. Run
`QUEST_QA=create-disposable-fixture node scripts/verify-live-quest.mjs`. It creates
its own fixture accounts, accepts no existing target ID, uses learner RPCs for
mutations and reads, then deletes only its own fixture graph and Auth accounts.
The first live run passed all 18 checks; see quest-api-proof-2026-10-10.json.
API execution does not replace secure browser sign-in, candidate server-action
checks, reflection Back-state in a browser or physical-device verification.
