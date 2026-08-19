# Stage 22 release proof

**Product:** PipuPath  
**Stage:** 22 — Human Potential Adventure & Reliability  
**Date:** 2026-08-19  
**Original release PR:** #38  
**Final proof-flow correction PR:** #40  
**Original validated runtime SHA:** `c74788cfa8f3532b20f999329daaa80dbc1f1e78`  
**Final correction runtime SHA:** `d1668ff9ce14161f56e916d42196ac77237e1eae`  
**Status:** RELEASED; FINAL PROOF-FLOW CORRECTION GATE PASSED

## Purpose

This record is the durable Stage 22 release evidence. It separates product defects from fixture/harness defects, records the exact runtime trees proven on Vercel and preserves the quota-control decisions used during release and final launch-quality correction.

## Original Stage 22 release

Navigation repair commit `cbd2ac492d0cc6ddace9a371276ad9a35badd3d9` passed canonical CI #1066.

The zero-tree release-proof trigger advanced the identical executable tree to `c74788cfa8f3532b20f999329daaa80dbc1f1e78`.

CI #1067 passed `npm run validate` on that exact runtime tree.

Corrective exact-head Preview `dpl_Bqm5FRy3qtN1kd9MjeaW386qBC6p` reached READY from that tree after the first deliberate Preview exposed the real Mission/Journey/Connect `AppShell` gap.

Disposable PR #39 was Vercel-disabled and closed without merge after CI #1068 passed the authenticated browser proof covering public recovery, Mission Control, Adventure Home, Growth, persistent Mission/Journey/Connect navigation, reduced motion and 390×844 mobile/no-overflow behaviour.

The dedicated staging analyst fixture used for Mission Control verification was immediately returned to `revoked` after proof.

PR #38 squash-merged as `cae7533cd2616c52547389612e9644773fc7eae0`.

The Vercel Git webhook did not create production from that squash event, so zero-file-difference main commit `44f0c835949b737fd1ab3bfa93e42d5dd244b50d` was used only to wake the production deployment without altering the application tree.

Production deployment `dpl_28dPmz3sqXBb3Rq1geNRWCdCG28T` reached READY and was aliased to the PipuPath production domains. Release smoke checks passed and Vercel reported no runtime error clusters in the verification window.

## Final proof-submission correction

A post-release user check found one remaining Stage 22 reliability gap: an expected Submit Proof path could land on an unexplained unavailable Quest state even though the released Stage 7 private evidence backend remained valid.

PR #40 fixes the access/experience boundary rather than replacing the backend:

- `/proof` becomes an authenticated compatibility gateway to the Builder's current Quest proof/detail state;
- `/quests/[questId]/proof` becomes a dedicated private Prove step for the active Quest owner;
- stale Quest/proof links resolve to current saved Quest state or the Quest path instead of a generic unavailable page;
- Quest-level not-found provides a truthful explanation and deterministic continuation;
- the evidence form retains the existing `submitQuestEvidenceAction`, Stage 7 RPC, private image bucket, validation and privacy semantics;
- evidence remains private; no automatic Portfolio/Profile/public publication is introduced;
- successful proof submission unlocks Reflection; XP is still awarded only through the existing exactly-once Quest completion transaction.

The dedicated Prove experience includes the current challenge, `Understand → Act → Prove → Reflect → Reveal` progress, evidence requirements, completion signal, optional link/image support, explicit privacy state and a clear next-step explanation.

## Final correction static gate

Canonical CI #1075 passed the complete `npm run validate` chain on product head `d1668ff9ce14161f56e916d42196ac77237e1eae`, including:

- Prettier formatting;
- zero-warning ESLint;
- strict TypeScript;
- unit tests and coverage thresholds;
- integration/regression tests, including the Stage 7 evidence lifecycle and new Stage 22 proof-flow contract;
- Next.js production build.

No Supabase migration was added.

## Final correction Preview control

Automatic Vercel Preview deployment remained disabled for `agent/stage-22-proof-finalization`.

A zero-file-difference carrier commit `8fe68b46b9adda6ef2c09c35b6ffa5f150103b89` was created solely to trigger the single deliberate correction Preview. GitHub comparison reports no changed files between the green product SHA and that carrier.

Preview:

- deployment: `dpl_4i6LT35NRVmXW6JTHCPd219CGMPy`;
- Vercel state: READY;
- source branch: `release/stage-22-proof-finalization`;
- carrier Git SHA: `8fe68b46b9adda6ef2c09c35b6ffa5f150103b89`;
- executable tree: identical to product SHA `d1668ff9ce14161f56e916d42196ac77237e1eae`.

No second correction Preview was created.

## Final correction authenticated browser and visual proof

Disposable PR #41 existed only to execute a targeted Chromium proof against the already-built correction Preview. Its own Vercel deployment was disabled and it was closed without merge after verification.

CI #1076 passed. The proof verified:

1. the authenticated staging Builder can reach `/proof` without an unavailable dead end;
2. `/proof` resolves to the active owned Quest's dedicated `/quests/[questId]/proof` route;
3. the page exposes the premium `Bring back what happened.` / `Show the action, not perfection.` Prove experience;
4. private-by-default messaging is visible;
5. evidence requirements, completion signal, privacy and next-step guidance are present;
6. the Submit Proof action is visible and usable;
7. desktop rendering is stable;
8. 390×844 mobile rendering retains the six-destination application navigation;
9. the mobile document has no horizontal overflow;
10. real private Quest proof submits successfully;
11. successful submission returns to the Quest and unlocks Reflection;
12. no `This path is not available` dead end appears in the proven flow.

The proof captured `stage22-proof-desktop.png` and `stage22-proof-mobile.png` in workflow artifact `stage22-proof-finalization-evidence`. Both screenshots were visually inspected before release lock; the final screen retains the Stage 22 premium hierarchy without compromising mobile readability or privacy clarity.

## Resource control

The correction consumed one deliberate Preview only. Implementation and disposable test branches remained Vercel-disabled. This documentation release lock is non-runtime and therefore does not justify another Preview.

## Final release decision

The final proof-flow correction at `d1668ff9ce14161f56e916d42196ac77237e1eae` has passed canonical static validation, exact-tree Vercel Preview, authenticated mutation proof, desktop/mobile layout checks and visual review.

PR #40 may proceed to intentional merge. After merge, production must reach READY on the exact correction tree (or a zero-file-difference deployment trigger of that tree) and receive final runtime/security smoke checks.

After that verification, Stage 22 is finalised and PipuPath remains in **controlled pilot → measure → improve → prove adoption**.
