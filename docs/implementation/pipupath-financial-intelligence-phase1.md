# PipuPath — Phase 1 Financial Intelligence implementation

**Status:** Isolated draft, final CI for 13 November changes pending; authenticated device testing and safeguarding/product-owner acceptance remain required. **Do not merge or deploy.**  
**Blueprint:** `PipuPath_Phases_1-4_Implementation_Blueprint.md` supplied 9 November 2026.  
**Branch:** `agent/pipupath-phase1-financial-intelligence` (Vercel auto-deploy explicitly disabled).

## Gap analysis (existing architecture)

- Stage 12 `economic-pathways` is **profile-linked possible careers/value creation**, not a practical financial-literacy curriculum. It must not be repurposed or discarded.
- `journey`, `mission`, and historical HQLS `quest` retain their canonical lifecycles. This addition is an optional, curated action path linked from Journey and Real Quests.
- The existing 3D city is a separate, stateful experience with camera, chapter save and resume logic. The new optional in-city practice panel is mounted within the existing 3D document and handoff; it **does not change the game engine, camera, chapters, saved decisions or progress format**.
- `real-build` already provides reviewed/AI templates, owner-only attempt reads, an active-attempt uniqueness constraint, versioned evidence submission, signed private photos and recovery. Reuse it; do not create another user progress table.
- `project` and `portfolio` are canonical project/selected proof surfaces. The phase provides opt-in links to them, but **does not falsely claim a Real Build attempt is automatically a published or independently verified portfolio artefact**.
- `requireAuthenticatedIdentity()` checks onboarding completion and guardian authorization; all new mutations use it before service-role access. Unknown age bands are denied, and Stage 9 is adult-only.
- AI-generated Real Builds consume bounded requests. New reviewed financial starters call **no model**, do not require cash or accounts and can be practised while the screen is open with limited connectivity.

## Reusable contract

`src/modules/builder-intelligence/domain/builder-pathway.ts` defines a versioned `BuilderPathway` with code, age eligibility, competencies, ordered prerequisites, curated city decisions, available naira, reviewed Real Build templates, safe resources, evidence/reflection prompts and review/fallback versions. This contract is available to later Leadership and Entrepreneurial Intelligence work but those pathways are **not implemented** in Phase 1.

`financial-pathway.ts` curates 9 ordered competencies: needs/wants, opportunity cost, budget, saving, work value, honest exchange, cash flow, scam recognition and borrowing risk. Under-13 can use stages 1–6; ages 13–17 stages 1–8; adults all 9. An actual attempt requires the previous eligible stage's recorded real-world attempt, not a simulated city decision. Failure `not_yet` is a legitimate reported attempt, not a dead end or an invented success.

Each city scenario presents a fictional resource constraint and at least two meaningful options with arithmetic consequences. These are optional city-district simulations displayed both in the Finance page and **within The Unbuilt City's existing optional Explore menu**. The in-world panel loads a static versioned scenario catalog, uses age-band guidance provided through the same-origin iframe, and shows arithmetic consequences over the still-visible city. It is not a new campaign chapter or an interactive 3D building, and it never writes player saves, credits, XP or private Quest evidence. The parent reuses the existing Save my city / Continue without saving choice when the player requests a real Quest. Game-day progress and camera remain unchanged.

## Authoritative persistence

A reviewed financial Quest is inserted into **existing** `real_build_templates` and `real_build_attempts` with `source='reviewed'`, a stable versioned catalog title, owner `user_id` and the current Real Build draft/evidence schema. Read history through owner-filtered queries and the existing database RLS. A read-only private finance-attempt summary now appears in the learner's authenticated Portfolio Vault and links back to the owned Real-World Quest detail, never a public proof URL. Formal Builder Project creation still requires its existing qualifying Journey Quest, and finance attempts do not bypass that requirement. Existing one-active-attempt uniqueness prevents double submission. Stage completion in the pathway means **a recorded self-report**, not audited financial competence, XP, capability verification or publication.

No migration, new backend service, privileged client API, AI-provider call or automatic cross-product sharing is added. The finance catalog remains marked **candidate-2026-11** until a human reviewer approves it; `source='reviewed'` reflects the database's existing curated-template category, not an independent safeguarding sign-off.

## Security and safety controls

1. Identity and existing guardian authorization checked server-side before any template or attempt operation.
2. Unknown, underage or locked stages rejected on the server, regardless of manipulated forms.
3. No external communication, borrowing, buying, selling, bank access, payment credentials or speculative investment task.
4. Reviewed challenge content passes the existing `validateChallenge` implementation/safety screens, with concrete real-world action and genuine test.
5. Only server-role writes; all own attempts read with `user_id` filter and inherited RLS.
6. Existing active Quest is returned instead of silently overwritten; unique-index race recovery is supported.
7. City choices are simulation only; recording evidence still requires actual evidence/reflection/next change and an outcome.

## Test matrix / exit gates

- [x] Catalog, city UI, same-origin iframe, age guidance, private evidence and action tests authored for safety, arithmetic, no fictitious XP, duplicate-active guard, locked-stage rejection and offline retry.
- [ ] Full `npm run validate` passing on the exact branch SHA (GitHub CI required).
- [ ] Authenticated browser youth / guardian / educator role acceptance on a non-production environment.
- [ ] Actual mobile portrait and Android navigation, low-bandwidth recovery and screen-reader review.
- [ ] Real-build attempt recorded end to end and inspected as private evidence with active/recorded recovery.
- [x] Authenticated actor-only private Finance attempt summaries integrated into the existing Portfolio Vault without exposing narratives, and links lead back to owned Real Quest details; automated owner-scope and provenance tests written.
- [ ] True conversion of Financial Real Build proof into a formal Builder Project remains a separate schema/RPC acceptance decision; the existing HQLS Quest source restriction is not bypassed.
- [ ] Product-owner and independent safeguarding approval.
- [ ] Controlled release approval, if any, with rollback and production SHA verification.

**Decision gate:** Stop after Phase 1, and do not start Phase 2 until acceptance. Production and Supabase remain unchanged.

## Scaling and governance

One versioned reviewed catalog allows KAEC's trained content reviewers to update competencies without engineers writing new user lifecycle engines. For later scale, move catalogue revisions into a reviewed publishing system with immutable version provenance; retain existing owner-only attempt storage. Pilot with 20–40 consenting learners. Measure attempted useful actions, safety incidents, zero-spend completion and usable evidence, not XP or raw page visits.
