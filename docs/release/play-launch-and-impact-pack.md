# PipuPath launch and impact pack

Date: 9 October 2026. Owner: KAEC-NG product/release operator.
Status: draft listing and test plan; not a submission or policy approval.

## Verified artifact

Candidate commit: ce6a4f081a65e0422a159048a528ee791550326a.
Owner screenshot shows Android workflow #15 successful on this candidate.
Uploaded ZIP contains APK, AAB, badging and checksums. All three recorded
SHA-256 checksums matched. AAB manifest was decoded directly:
package ng.name.pipupath.lite, version 1.0.2, code 3, minimum SDK 21,
target and compile SDK 36. AAB certificate matches the pinned production key:
8E:24:7B:ED:BB:2E:5C:A7:D2:B6:CC:D1:88:E2:00:32:6C:7E:65:28:18:4C:76:EA:CE:96:BC:F0:3B:D2:59:8C.
OpenSSL verified the AAB CMS signature; manifest and all 465 signed entry
digests matched, with no unsigned payload. No native .so libraries found.
APK hash matches; APK signing schemes were not independently verified here.
No physical device, Play-delivered build or pre-launch report was tested.

AAB SHA-256:
80656ff9a35edd3175138081b507184093bc621e80ef339c5f3141233b58f244
APK SHA-256:
0a90d017f429a1e8b9eb04f203d1d03e9c6eb551344ebbe84d4300965f244dde

Owner screenshots show the existing personal developer account restricted
for identity verification. A replacement document is under Google review.
No new upload is requested on that screen. Do not claim reinstatement until
Console confirms it. App code changes do not resolve this account restriction.

## Store listing draft

App name: PipuPath

Short description:
Discover your strengths. Build real projects. Reflect on what you learn.

Full description:
Turn what you discover about yourself into something you can do.

PipuPath guides you through practical challenges, projects and reflection.
Explore your interests and strengths, choose a meaningful direction, then
take your next step in the real world.

With PipuPath, you can:
- Explore your interests through guided Discovery questions.
- Use AI-assisted guidance to plan missions and practical next steps.
- Work through challenges and record evidence of what you tried.
- Reflect on what happened and what you learned.
- Develop projects through milestones.
- Connect and collaborate through the features available to your account.

Your private developmental work does not become public automatically.
Eligible adults can choose to publish selected project proof.

PipuPath is built around action, evidence and reflection. AI guidance is a
starting point to test, not a fixed verdict about who you are. It does not
guarantee income, employment or a particular outcome.

An internet connection and account are required for the core experience.

Support: copyartint@gmail.com

Submission notes: suggested category Education; confirm in Console. Do not
declare advertising, monetisation, age groups or data practices from this
draft alone. Validate the deployed app, providers and Console questionnaire.
Privacy and deletion URLs must work on the production domain before submission:
https://www.pipupath.name.ng/privacy
https://www.pipupath.name.ng/account-deletion
The current privacy notice is explicitly provisional.

## Screenshot brief

Capture the real release candidate with a disposable test account and no
student names, private reflections, contact details or fabricated achievements.
Use the existing golden P branding. Do not fabricate app screens or testimonials.

| Screen | What the image should demonstrate |
| --- | --- |
| Home | A clear next action |
| Discover | Guided reflection on interests |
| Build | An actual challenge and next step |
| Evidence/reflection | How real-world work is recorded |
| Project | Milestones with genuine test evidence |
| Profile | Private development and account controls |

Keep captions plain: Discover your direction; Take your next step; Bring back
your proof; Learn from the experience; Build something useful.
Screenshots require actual authenticated capture; none are supplied by this pack.

## Data safety evidence worksheet

Complete against current Google definitions and actual deployed flows,
including service providers. Collection and sharing are different definitions;
sending data to a processor cannot be classified without checking the exemption.

| Area observed in source | Verification needed before answering Console |
| --- | --- |
| Account identity and age band | Required fields, purposes, retention, guardian handling |
| Discovery and AI guidance | Exact payloads sent to OpenAI and actual provider settings |
| Evidence, reflections and uploads | Text/images/links retained; private/public controls |
| Connect and messages | Recipient access, age gates, adult controls, reports/blocking |
| Portfolio and Passport | Publishing eligibility, preview/withdrawal and share expiry |
| Product/operational events | Event fields, identifiers, vendor logs and retention |
| Deletion request | Ownership verification, fulfilment, storage removal and exceptions |

## Release gates and owners

| Gate | Accountable owner | Evidence required |
| --- | --- | --- |
| Identity reinstatement | Account owner | Google email plus unrestricted Console |
| Age/Families review | Safeguarding lead + product operator | Actual age screen, child-safe integrations and social controls |
| Privacy/retention | Privacy operator + appropriate reviewer | Approved purposes, categories, time limits and exceptions |
| Deletion fulfilment | Privacy operator and backup | Disposable-account lifecycle including storage/public links/sessions |
| Android device QA | Test operator | Device/version and reproducible pass/fail evidence |
| Play signing | Release operator | Correct app-signing fingerprint and upgrade compatibility |
| Version code | Release operator | Code exceeds highest Console upload |
| App access | Release operator | Controlled reviewer account with reproducible instructions |
| Production pages | Release operator | Privacy/deletion links and candidate behavior on live domain |

Google Families rules apply when children are part of the target audience.
Source includes under_13; do not relabel the app adult-only to avoid this review.
Check adult management of social features, adult action before exchanging
personal information, safety reminders and child-appropriate AI/vendor terms.
The TWA architecture also needs an explicit Families functionality review:
a successful Android build does not establish policy eligibility.

## Facilitator-run pilot

Start with a small supervised cohort after the age/safeguarding gates relevant
to those participants pass. Use one weekly cycle:
choose a useful challenge, act outside the app, submit evidence, reflect,
choose the next step. Do not use participant data as public marketing material.

Facilitator responsibilities:
- Explain the task without operating the app for the learner.
- Record where the learner hesitates, asks for help or loses saved work.
- Check evidence and reflection for substance rather than XP or page views.
- Log defects with device, steps, expected result and actual result.
- Escalate safety/privacy problems immediately to the assigned operator.

| Measure | Definition |
| --- | --- |
| First useful action | Time from starting to stating a specific achievable real-world step |
| Independent start | Learners who can identify and start the next action without help / learners observed |
| Evidence completion | Learners returning credible proof / learners starting the challenge |
| Reflection quality | Can the learner explain what happened, what changed and the next step? |
| Return to action | Learners taking another real-world step next cycle / eligible learners |
| Persistence failures | Lost work, duplicates or misleading saved/success messages |

Set targets after observing the baseline; no achieved rates are claimed.
Scale through a reusable facilitator script, operator queue and weekly defect
review. Fix repeated friction once for all cohorts. Increasing users 100-fold
must not require 100-fold founder involvement.

## Device and simplicity checklist

Use the APK from the verified ZIP for direct-install tests; Play-delivered
signing and TWA trust need a separate internal-track test after reinstatement.
Do not uninstall an existing app to hide an upgrade failure.

1. Upgrade the existing install; confirm package identity, golden P and stored access.
2. Sign in, recover access and complete/resume onboarding without losing answers.
3. Ask the learner: What should you do next? Observe without coaching.
4. Start a challenge, save evidence, reload, reflect and inspect persisted state.
5. Background/resume repeatedly; test session expiry, Android Back and interrupted connectivity.
6. Test narrow screens and large system text for overlaps and unreadable buttons.
7. Check reporting/blocking and age restrictions using authorised disposable accounts.
8. Request deletion only on a disposable account when the preview gate is enabled;
   verify receipt, restricted operator review and actual fulfilment.
9. Record device model, Android/browser version, installation source and result.

Current source review: Build prioritises a current action and Discover has one
primary destination; both are useful simplification choices. Previously reported
text overlap, unreadable Home button, missing launcher icon and idle crash
require actual mobile regression tests. No full-app usability pass is claimed.

Prioritise:
P0: data loss, safeguarding bypass, unauthorised access, false persistence.
P1: unclear next action, repeated instructions, blocked recovery, mobile overlap.
P2: visual polish after the developmental loop is understandable and reliable.

## Official references

- https://support.google.com/googleplay/android-developer/answer/13393723
- https://support.google.com/googleplay/android-developer/answer/9893335
- https://support.google.com/googleplay/android-developer/answer/11043825
