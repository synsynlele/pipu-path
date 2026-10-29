# Game to real-world release review

29 October 2026. The owner authorises a whole-app review, necessary improvements
and a production release after verification. This supersedes earlier preview-only
instructions. It does not authorise fabricated learner activity or evidence.

## Product and route review

The release starts from `c75b576`, the latest compact-controls preview, rather
than the older local integration draft. Existing mobile, graphics, authentication
contrast and three-destination navigation work is preserved.

| Boundary                      | Decision and verification                                                                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public landing → Play         | Keep account-free `/play`, the same mounted city iframe and optional device-only saving. Build in real life now opens the same Real Quests entry as the game.                                                         |
| Play → Real Quests            | Replace the public signup-only exit with `/real-quests`. The protected route owns sign-in and the return destination. No game result becomes account evidence.                                                        |
| Saving and cancellation       | Keep explicit save/leave/stay choices. Use a native modal dialog for keyboard containment, Escape dismissal and focus restoration. Publish save failure state after the actual storage attempt.                       |
| Sign-in → personal work       | Preserve only recognised district context through the protected-route redirect, and preserve rotated session cookies. Read-only orientation can precede Discovery; identity/guardian and actual Quest gates remain.   |
| Real Quests next move         | Use the account's authoritative next prerequisite, actionable owned Quest/reflection or active Project. Remove the duplicate inference that skipped identity, review and Project states.                              |
| Real Quests navigation        | Add the shared app shell so Play, Real Quests and You remain available.                                                                                                                                               |
| Inspiration → action          | Offer all fourteen districts through an allowlist, safe starter ideas, five small steps, evidence guidance and reflection. These are not newly generated or completed Quests and earn no XP.                          |
| Mission → Journey → Quest     | Retain existing server actions, generation limits, ownership checks and activation requirements. No new AI calls or schema changes.                                                                                   |
| Quest → evidence → reflection | Retain real action requirements, private proof, retry/error states and authoritative completion. Never submit invented proof for a release test.                                                                      |
| You → support tools           | Retain Discovery, profile versions, Projects, Portfolio, Growth, Guide, collaboration, opportunities, Passport, privacy and role-aware operations. Keep these outside primary navigation.                             |
| Session privacy               | Preserve SSR cache headers on refresh and use private/no-store session redirects. No credential or learner context is sent into the city frame.                                                                       |
| Graphics and chapters         | Retain bounded rendering, relevant construction, saved-choice revision, 36 decisions, seven Chapter 3 days and the first three Chapter 4 resilience challenges. Automated runtime and conservation tests cover these. |

## Dependency release gate

The pre-release production dependency audit found six affected packages,
including a critical Next.js advisory. The candidate pins Next.js and
eslint-config-next 16.4.3, Zod 4.6.7, Sharp 0.35.5, PostCSS 8.5.32, Nano ID
3.3.18 and source-map-js 1.2.2. The lockfile is committed and the full validation
must run again on this dependency set. Authoritative advisory references:

- https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw
- https://github.com/advisories/GHSA-mrhx-c7xc-m3w5
- https://github.com/advisories/GHSA-fxqj-rqcc-2cmp

Installed web-app entry now opens `/`, allowing free play for visitors and
Play-first Home for signed-in users. The Play shortcut opens public `/play`.
Package identity, icons, user data and permissions are unchanged.

## Release evidence and limits

Repository validation covers formatting, lint, types, city runtime/endurance,
unit/component coverage, database-contract integration tests and a production
build. Browser checks cover public play, cancellation, saving and sign-in return.
Authenticated learner screens need an authorised test account for live browser
verification; mocks are not evidence that live generation or evidence writes
succeeded. Physical Android GPU reliability needs real-device observation.

Release records must name the exact tested source commit and deployed target,
verify the production URL after release and retain a rollback deployment.
Avoid speculative deployments: one coherent preview, followed by a deliberate
production build only when release gates are satisfied. No database migrations,
learner-data rewrites or permission changes are part of this slice.

The patched production dependency audit (`npm audit --omit=dev`) reports zero
known vulnerabilities. New framework lint rules retain explicit, documented
exceptions for native APK downloads; switching those actions to App Router
navigation would change download behaviour.

Compatible development-tool patches, including Vitest and coverage 4.1.12,
are also locked. The complete `npm audit` now reports zero known vulnerabilities
across production and development dependencies.

Final local validation passed: formatting, lint, types, city runtime/endurance,
541 unit/component tests, 251 integration tests and the production build on
Next.js 16.4.3. Complete dependency audit: zero known vulnerabilities. Live
learner browser acceptance remains pending; this is not yet a production release.
