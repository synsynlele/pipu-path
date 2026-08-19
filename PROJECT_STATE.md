# PipuPath project state

**Current stage:** Stage 22 — Human Potential Adventure & Reliability

**Stage status:** RELEASE GATE PASSED — PR #38 is the Stage 22 release vehicle; controlled pilot begins after merge.

**Released baseline entering Stage 22:** Stages 0–21.

**Stage 21 release:** PR #37 squash-merged on 2026-08-18 as `ee09f96d02adb72079b4ce4a29a3e2f872f618db`.

**Stage 22 release candidate:** `c74788cfa8f3532b20f999329daaa80dbc1f1e78` on `agent/stage-22-human-potential-adventure`.

**Stage 22 PR:** #38 — `Stage 22 — Human Potential Adventure & Reliability`.

**Stage 22 authority:** `docs/stages/stage-22-human-potential-adventure.md`.

**Locked product direction:** `docs/product/human-potential-adventure-direction.md`.

**Growth Pack direction:** `docs/product/growth-pack-direction.md`.

**Final release evidence:** `docs/release/stage-22-release-proof.md`.

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

- Adventure Home now prioritises current Campaign, one dominant Next Move, Journey progress, truthful Builder level/XP and contextual Builder Guide support.
- Journey is an accessible Adventure Map rather than a prose-first page.
- Quest experience follows `Understand → Act → Prove → Reflect → Reveal` with progressive disclosure.
- Projects use Major Build framing while preserving Project semantics and evidence lifecycle.
- Portfolio is experienced as the Builder Vault with private-by-default selective publication.
- Living Builder Profile presents evidence-backed capabilities as a Skill Tree without inventing capability scores.
- Opportunities are framed as Deployment Doors without probabilistic employability claims.
- Growth Pack recommendations are contextual to the current adventure; Growth Library revisits prior contextual suggestions and does not become a generic content catalogue.
- Mission Control is visibly available only to active platform administrators; server/data authorization remains authoritative.
- public-proof failures recover safely without exposing private proof.
- primary navigation remains six stable destinations: Home, Journey, Build, Vault, Connect and Me.
- Mission, Journey and Connect now remain inside the authenticated `AppShell`, closing the final live-discovered navigation dead end.
- mobile and reduced-motion behavior are part of the release proof.

## Final quality state

The Stage 22 release candidate passed the canonical repository validation chain on exact head `c74788cfa8f3532b20f999329daaa80dbc1f1e78` through CI #1067.

The corrective exact-head Vercel Preview `dpl_Bqm5FRy3qtN1kd9MjeaW386qBC6p` reached READY from that same SHA.

The isolated authenticated release proof passed in CI #1068 against that Preview, including:

- public landing and proof-unavailable recovery;
- unauthenticated admin protection;
- authenticated Mission Control access for the dedicated staging analyst fixture;
- Adventure Home and six-destination navigation;
- Growth Library/Growth Pack surface;
- persistent navigation across Mission, Journey and Connect;
- reduced-motion rendering;
- 390×844 mobile navigation and horizontal-overflow check.

The staging analyst fixture was returned to `revoked` immediately after proof. No Stage 22 Supabase schema migration was required.

The first deliberate Stage 22 Preview exposed the real Mission/Journey/Connect shell gap. A single corrective Preview was then created after the fix passed static CI; automatic implementation-branch previews remained suppressed throughout.

## Safety / anti-dark-pattern boundary

Stage 22 does not introduce gambling mechanics, paid random rewards, fake urgency, manipulative infinite feeds, child popularity leaderboards, shame-based streaks, fabricated social activity, unrestricted minor/adult messaging, public leakage of private development evidence or AI pretending to be a human mentor.

Progress remains tied to meaningful developmental action and evidence, not page views or compulsive return behaviour.

## Next operating mode

After PR #38 is intentionally merged and production is verified on the merge commit, PipuPath moves into **controlled pilot → measure → improve → prove adoption**.

Do not begin Mentor Network, unrestricted communities/chat, payments or another major product layer merely because Stage 22 is complete. The next work should be driven by observed Builder use, retention, completion, proof quality and real-world outcomes.
