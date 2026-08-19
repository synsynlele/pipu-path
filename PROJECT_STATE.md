# PipuPath project state

**Current stage:** Stage 22 — Human Potential Adventure & Reliability

**Stage status:** RELEASED + FINAL PROOF-FLOW CORRECTION GATE PASSED

**Released baseline entering Stage 22:** Stages 0–21 are released.

**Stage 21 release:** PR #37 squash-merged on 2026-08-18 as `ee09f96d02adb72079b4ce4a29a3e2f872f618db`.

**Stage 22 release:** PR #38 squash-merged on 2026-08-19 as `cae7533cd2616c52547389612e9644773fc7eae0`.

**Stage 22 production baseline:** zero-file-difference deployment trigger `44f0c835949b737fd1ab3bfa93e42d5dd244b50d`; Vercel production `dpl_28dPmz3sqXBb3Rq1geNRWCdCG28T` reached READY.

**Final Stage 22 proof-flow correction:** PR #40 — `Stage 22 finalization — premium private proof flow`.

**Validated correction runtime SHA:** `d1668ff9ce14161f56e916d42196ac77237e1eae`.

**Stage 22 authority:** `docs/stages/stage-22-human-potential-adventure.md`.

**Locked product direction:** `docs/product/human-potential-adventure-direction.md`.

**Growth Pack direction:** `docs/product/growth-pack-direction.md`.

**Release evidence:** `docs/release/stage-22-release-proof.md`.

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`; Vercel project `copyartint-2860s-projects/pipu-path` linked to `synsynlele/pipu-path`.

**Last updated:** 2026-08-19

## Product doctrine now in force

> **The screen is not the game. Life is the game.**

PipuPath is governed as a **Human Potential Adventure System**. The application gives direction, challenge, feedback, progression and proof while meaningful development happens primarily in the Builder's real life.

The released developmental engine remains authoritative:

`Discovery → Human Potential Profile → Possible Paths → Mission → Journey → Quest → Evidence → Reflection → Capability → Project → Portfolio / Connect → Collaboration → Living Builder Profile → AI Personal Builder Guide → Capability Verification → Institution / Opportunity → Builder Passport`

Stage 22 changes how that engine is experienced; it does not replace the domain model, lifecycle, persistence, privacy or safeguarding boundaries.

Experience mapping:

- Mission = Campaign;
- Journey = Adventure Map;
- Quest = Real-World Challenge;
- Evidence = Proof of Action;
- Reflection = Learn & Power Up;
- Capability = evidence-backed Skill Tree;
- Project = Major Build / Boss Build;
- Portfolio = Builder Vault;
- Opportunity = Deployment Door / New World;
- Passport = Portable Builder Identity.

## Stage 22 delivered

- Adventure Home prioritises current Campaign, one dominant Next Move, Journey progress, truthful Builder level/XP and contextual Builder Guide support.
- Journey is an accessible Adventure Map rather than a prose-first page.
- Quest follows `Understand → Act → Prove → Reflect → Reveal` with progressive disclosure.
- Projects use Major Build framing while preserving Project semantics and evidence lifecycle.
- Portfolio is the Builder Vault with private-by-default selective publication.
- Living Builder Profile presents evidence-backed capabilities as a Skill Tree without inventing capability scores.
- Opportunities are framed as Deployment Doors without probabilistic employability claims.
- Growth Pack recommendations are contextual to the current adventure; Growth Library revisits prior contextual suggestions and does not become a generic content catalogue.
- Mission Control remains role-aware and server-authorised.
- primary navigation remains six stable destinations: Home, Journey, Build, Vault, Connect and Me.
- Mission, Journey and Connect remain inside the authenticated `AppShell`.
- mobile and reduced-motion behaviour are part of the release proof.

## Final proof-flow correction

A post-release user check exposed one remaining launch-quality failure: the expected Submit Proof path could resolve into an unexplained unavailable Quest state even though the Stage 7 evidence backend still existed.

PR #40 closes that reliability gap without changing the evidence lifecycle:

- `/proof` is now an authenticated compatibility gateway that resolves the Builder's current Quest instead of generic-404ing;
- `/quests/[questId]/proof` is a dedicated premium **Prove** step for an active owned Quest;
- stale Quest/proof links recover to the Builder's current Quest or Quest path;
- Quest-specific not-found state explains that the adventure moved forward and offers deterministic continuation;
- proof submission still uses the released private `submitQuestEvidenceAction`, private `quest-evidence` storage and Stage 7 RPC lifecycle;
- evidence remains private by default and does not publish to Profile, Builder Vault or public proof automatically;
- successful submission unlocks Reflection; XP remains earned only after the Quest is truthfully completed.

The Prove screen now gives the evidence action a focused premium experience: current challenge, five-phase progress, proof requirements, completion signal, privacy explanation, supporting link/image controls and a clear account of what happens next.

## Final quality evidence

Canonical CI #1075 passed the complete repository validation chain on `d1668ff9ce14161f56e916d42196ac77237e1eae`.

A zero-file-difference carrier commit `8fe68b46b9adda6ef2c09c35b6ffa5f150103b89` produced the single deliberate correction Preview:

- Vercel deployment: `dpl_4i6LT35NRVmXW6JTHCPd219CGMPy`;
- state: READY;
- executable tree: identical to `d1668ff9ce14161f56e916d42196ac77237e1eae`.

Disposable CI-only PR #41 was Vercel-disabled and closed without merge after browser verification.

CI #1076 passed the targeted authenticated Chromium proof against that Preview. It verified:

- legacy `/proof` resolves to the active Quest Prove screen;
- the premium Prove experience renders on desktop;
- 390×844 mobile rendering retains the application navigation and has no horizontal document overflow;
- the page contains no unexplained `This path is not available` dead end;
- real private Quest proof can be submitted successfully;
- successful proof submission returns to the Quest and unlocks Reflection.

Desktop and mobile screenshots were captured in the `stage22-proof-finalization-evidence` workflow artifact and visually reviewed before release lock.

No Supabase schema migration was required for this correction.

## Safety / anti-dark-pattern boundary

Stage 22 does not introduce gambling mechanics, paid random rewards, fake urgency, manipulative infinite feeds, child popularity leaderboards, shame-based streaks, fabricated social activity, unrestricted minor/adult messaging, public leakage of private development evidence or AI pretending to be a human mentor.

Progress remains tied to meaningful developmental action and evidence, not page views or compulsive return behaviour.

## Next operating mode

After PR #40 is merged and the exact production deployment is verified, PipuPath remains in **controlled pilot → measure → improve → prove adoption**.

Do not begin Mentor Network, unrestricted communities/chat, payments or another major product layer merely because Stage 22 is complete. The next work should be driven by observed Builder use, retention, completion, proof quality and real-world outcomes.
