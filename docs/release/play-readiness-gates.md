# PipuPath public release gates

Checked 10 October 2026. This is an operator handover, not a release certificate.

| Gate                          | Evidence                                                                                   | Status                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| Short Discovery               | Owner completed onboarding; database verifies 8 questions per age band, 7 required         | Passed for reported test                             |
| Signed Android candidate      | Verified 1.0.2/code 3 AAB; SDK 36; candidate predates new interface                        | Available for testing                                |
| Core code                     | Local full validation passes, including private preflight                                  | Passed locally                                       |
| Google login in preview       | Actual reviewed-preview return; Quest/Home reload persistence observed                     | Passed observed Google flow                          |
| Quest lifecycle browser proof | Owner completion/+50 XP and next Quest after reload observed; learner API 18 checks passed | Happy path observed; browser Back regression pending |
| New interface on Android      | Prior tablet report predates this candidate                                                | Pending physical regression                          |
| Account deletion              | Real Auth/Storage fixture proof passed; processing disabled                                | API proof passed; guardian/provider gates pending    |
| Retention and privacy         | Schedule approved; receipt expiry active; guardian/provider review pending                 | Founder operates; provider/guardian checks remain    |
| Youth/social requirements     | Supports under-13 identity; social features need age/guardian policy proof                 | Pending Families review                              |
| Store screenshots             | None captured from authenticated release candidate                                         | Pending                                              |
| Google account                | Owner reports Console active; no independent dashboard inspection                          | Owner reported                                       |
| Store submission              | Browser security review rejected Console access                                            | Not submitted                                        |

## Deletion inventory delivered

Migration `account_deletion_preflight` is applied to the connected database.
Only service_role may execute it. An authenticated owner/operator can inspect
`/admin/privacy/[requestId]`; other roles are denied before private reads.
The existing queue links to that route when privacy operations are enabled.
Request collection remains gated; this change does not enable it.

The function counts public foreign keys pointing directly to auth users and
profiles, and owned storage objects. It reports per-reference counts without
returning reflection text, file names or message content. The same record may
appear in multiple counts. It never deletes data or certifies readiness.

Schema inspection found RESTRICT references in Passport versions/shares,
opportunity applications, providers, opportunities and membership attribution.
SET NULL audit references can leave narrative/snapshot content after auth
deletion. Child rows, shared Passport/application snapshots, collaboration and
provider-retained data must be traced before implementing the executor.
Use Storage API to remove files; SQL metadata deletion does not remove blobs.

A temporary auth/request fixture verified real inventory counts, preserved
account existence and service-only execution privileges. The entire fixture
transaction was rolled back. No existing user records were deleted.

## Next executable work

1. Register the PipuPath preview callback rule in hosted Auth, preserving the
   production callback. Test actual Google return on the same preview origin.
2. Configure an authorised disposable test account and run the current quest
   lifecycle, including evidence persistence, Back preservation, completion,
   exactly-once XP and the next unlock. Test failure paths too.
3. The 7/30/90 schedule is approved. Finalise exception handling and provider
   retention facts. Review nested/shared
   dependencies, run the implemented deletion workflow and verify storage,
   public links, snapshots and authentication removal on disposable fixtures.
   Never mark a request fulfilled before verification completes.
4. Finalise privacy, target audience and Data safety from deployed behavior;
   test child social controls before declaring child age groups.
5. Retest Android, capture real screenshots, merge/promote the approved code,
   then run Play internal testing before requesting public review.

The owner explicitly waived backup handover as a release blocker and will run
operations meanwhile. Each remaining gate needs an accountable operator and
evidence linked to the exact candidate. Facilitators run the same scripted user journey and report failures;
founder approval is not the normal QA or request-processing step.

Official requirements:

- https://support.google.com/googleplay/android-developer/answer/10144311
- https://support.google.com/googleplay/android-developer/answer/13327111
- https://support.google.com/googleplay/android-developer/answer/9893335

The concrete policy proposal is in `docs/release/privacy-retention-decision.md`.
The owner approved its 7/30/90-day operational schedule. Receipt expiry is active
and candidate deadline flags are implemented. Public promises, guardian controls,
provider verification remain gates. Backup practical handover is deferred
follow-up work under the owner decision, not a claimed pass. See
`docs/release/founder-operated-pilot.md`.
