# Stage 22 release proof

**Product:** PipuPath  
**Stage:** 22 — Human Potential Adventure & Reliability  
**Date:** 2026-08-19  
**Release PR:** #38  
**Validated runtime SHA:** `c74788cfa8f3532b20f999329daaa80dbc1f1e78`  
**Status:** RELEASE GATE PASSED

## Purpose

This record is the durable release evidence for Stage 22. It separates product defects from test-fixture/harness defects, records the exact runtime commit proven on Vercel, and preserves the quota-control decisions used during release.

## Static validation

Navigation repair commit `cbd2ac492d0cc6ddace9a371276ad9a35badd3d9` passed canonical CI #1066.

The zero-tree release-proof trigger advanced the identical executable tree to `c74788cfa8f3532b20f999329daaa80dbc1f1e78`.

CI #1067 passed `npm run validate` on that exact SHA, covering:

- Prettier formatting;
- zero-warning ESLint;
- strict TypeScript;
- unit tests and coverage thresholds;
- integration/regression tests;
- Next.js production build.

## Preview control

Automatic Vercel Preview deployment was disabled for the Stage 22 implementation branch.

The first deliberate Stage 22 Preview was created only after static readiness. Its browser gate did its job and exposed a genuine premium-UX defect: the primary Mission, Journey and Connect routes were not all inside the shared authenticated application shell.

No release was attempted from that Preview.

The defect was repaired at the layout boundary in commit `cbd2ac492d0cc6ddace9a371276ad9a35badd3d9`:

- `src/app/mission/layout.tsx` adds authenticated `AppShell` containment;
- `src/app/journey/layout.tsx` adds authenticated `AppShell` containment;
- `src/app/connect/layout.tsx` preserves Builder Network/Collaborations controls inside authenticated `AppShell` containment;
- `tests/integration/stage-22-navigation-shell.test.ts` locks the contract.

After that repair passed CI, one corrective exact-head Preview was created:

- deployment: `dpl_Bqm5FRy3qtN1kd9MjeaW386qBC6p`;
- Vercel state: READY;
- source branch: `release/stage-22-browser-proof`;
- exact Git SHA: `c74788cfa8f3532b20f999329daaa80dbc1f1e78`.

No automatic implementation-branch Preview was consumed.

## Browser proof

Disposable PR #39 existed only to execute Playwright against the already-built Stage 22 Preview. Its own Vercel deployment was disabled and it was closed without merge after verification.

CI #1068 passed the isolated browser proof against `dpl_Bqm5FRy3qtN1kd9MjeaW386qBC6p`.

The proof covered:

1. public landing loads successfully;
2. private-by-default messaging is visible;
3. an unavailable public proof returns a safe explanatory recovery experience;
4. anonymous `/admin` access returns to authentication;
5. the dedicated active staging analyst can enter Mission Control;
6. Adventure Home exposes the current Next Move, Adventure Map and Builder level;
7. desktop application navigation exposes Home, Journey, Build, Vault, Connect and Me;
8. active admin receives the visible Mission Control entry from Home;
9. Growth Library/Growth Pack surface loads with the learning-resource safety disclaimer;
10. `/mission`, `/journey` and `/connect` each retain the shared application navigation;
11. reduced-motion mode retains understandable content and navigation;
12. a 390×844 viewport exposes the mobile six-destination navigation;
13. the mobile page has no horizontal document overflow.

Vercel runtime logs contained no `error` or `fatal` entries during the proof window.

## Fixture integrity

The existing staging E2E account had a `platform_admins` row with role `analyst` but status `revoked`. That correctly caused the first admin browser check to return a generic 404.

For the final admin proof only, the dedicated staging fixture was temporarily restored to a constraint-valid active state. After CI #1068 passed, the fixture was immediately returned to:

- role: `analyst`;
- status: `revoked`;
- `revoked_at`: populated.

No production user role or production data was modified.

## Database state

Stage 22 required no new Supabase schema migration. Existing released RLS, lifecycle, profile/evidence persistence and authorization boundaries remain authoritative.

## Release blockers

No unresolved PR #38 review threads or submitted review blockers remained at release-lock time.

## Final release decision

The Stage 22 runtime tree at `c74788cfa8f3532b20f999329daaa80dbc1f1e78` has passed both canonical static validation and the authenticated corrective exact-preview browser proof.

The release-lock documentation commit that references this file is documentation-only. It must not change application source, configuration, dependencies or database schema and therefore does not justify a third Vercel Preview.

PR #38 may proceed to intentional merge. After merge, production must be verified READY on the merge commit and checked for runtime errors before Stage 22 is considered released into controlled pilot.
