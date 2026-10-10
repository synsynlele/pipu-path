# Final release actions — 10 October 2026

Status: engineering candidate validated; public release and Play upload pending.
Latest validated code/test head: e6867dcb6b1d4bb3a7f0b35d78f2513d58797a91.
CI run 38058203597: validate passed; staging-e2e skipped.

## Evidence already complete

- 424 unit/component and 242 integration tests, types, lint, formatting and build.
- Actual Google preview return plus Quest/Home reload session persistence.
- Focused action controls, private proof form and Back navigation observed.
- Live learner API proof: all 18 checks passed; exactly-once 50 XP, next unlock,
  negative cases and cross-user privacy; both disposable accounts removed.
- Existing production Android archive rechecked: APK/AAB hashes match the recorded
  inspected artifact; package ng.name.pipupath.lite, version 1.0.2/code 3, SDK 36.
- Backup practical handover explicitly owner-waived; it is not a release blocker.

## Remaining actions and exact acceptance evidence

| Action                     | Responsible role                                        | Completion evidence                                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Candidate browser mutation | QA operator                                             | Secure sign-in to a designated disposable account; proof submission, reflection Back-state, completion, reload and next unlock on the candidate                                                                    |
| Android regression         | QA operator with physical phone/tablet                  | New interface: Google return, readable actions, proof/reflection, Back navigation, idle/resume; device and Android/Chrome versions recorded                                                                        |
| Provider controls          | Infrastructure custodian                                | Actual Supabase backup/PITR/export windows; Vercel log/drain retention; OpenAI organisation data controls; privacy notice accurately reflects verified settings                                                    |
| Child authorisation        | Product/engineering and nominated safeguarding reviewer | Implemented and verified guardian authority/consent workflow before child recruitment or the relevant youth release                                                                                                |
| Production promotion       | Release operator                                        | Merge reviewed candidate after applicable gates; verify the live domain and normal Google return                                                                                                                   |
| Play internal release      | Console owner/release operator                          | Highest prior version code checked, signing arrangement chosen, actual installed-app certificate added to assetlinks, accurate listing/Data safety/app access, real screenshots, internal-track/pre-launch results |

Browser credentials must use the secure sign-in handoff. Do not inject API fixture
sessions into a browser or use synthetic learning submissions on the owner account.
The live API proof does not replace candidate browser/server-action verification.

The APK is a TWA shell that opens the live website. The current candidate
interface is not embedded in its bytes; installing it before production promotion
still opens production. Rebuild only when the Android wrapper/version requires
change. No new final package or Play-delivered signing/trust pass is claimed.

Play Console navigation was previously rejected by automatic approval review.
Use the Console owner's normal trusted session for upload; no alternative
automation route or submission has been attempted.

## Operator improvement loop

Use quest-qa-checklist.md and pilot-feedback-template.csv at every release.
An operator runs the checks, records exact evidence and escalates reproducible
failures; the founder resolves policy decisions rather than repeating QA. Group
feedback by failed stage, fix the most common blocked action, then recheck. The
same process serves cohorts 100 times larger and builds a reusable defect and
verification history. No achieved adoption or impact rate is claimed.
