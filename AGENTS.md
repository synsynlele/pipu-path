<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PipuPath engineering rules

## Mandatory agent startup protocol

Before planning, designing, coding, refactoring, or proposing a new PipuPath stage, read these authorities in order:

1. `docs/engineering/constitution.md`
2. `docs/product/adventure-experience-constitution.md`
3. `docs/product/human-potential-adventure-direction.md`
4. `docs/product/growth-pack-direction.md`
5. `docs/architecture/system-overview.md`
6. `PROJECT_STATE.md`
7. `docs/implementation/status.md`
8. The stage document relevant to the next incomplete stage

Do not rely on chat memory as product authority when these repository documents are available. If a new chat or agent enters the repository, it must rediscover the product from these files before changing it.

## Non-negotiable rules

- Build complete vertical slices in stage order.
- Preserve the Mission → Journey → Quest → Evidence → Reflection → Capability → Project → Portfolio → Opportunity → Passport developmental engine unless an explicit future authority replaces it.
- **PipuPath is a Human Potential Adventure, not a dashboard-first SaaS product.** The screen structures and rewards real-world development; life is the primary game world.
- The Adventure Experience Constitution is a release gate, not optional design guidance. A feature can be functionally correct and still be incomplete if it presents the Builder's journey mainly as generic cards, forms, tables, long prose, or equal-weight navigation without adventure context, progression, consequence, or reveal.
- Every Builder-facing primary flow must make the current Campaign/Path context, present challenge, next meaningful action, and consequence of action understandable within seconds.
- The Journey must remain spatial/progressive; the Quest must follow `Understand → Act → Prove → Reflect → Reveal`; evidence-backed growth must visibly change the adventure.
- **Builder agency is authoritative.** A Builder may change developmental Path. A pivot must preserve historical Missions, Quests, Evidence, Reflection, XP and Capability provenance; pause/archive incompatible active work explicitly; and start the new direction without destructive rewriting of the past.
- Do not add a major product layer while primary released Builder flows materially violate the Adventure Experience Constitution. Correct experience drift first unless the user explicitly overrides this gate.
- Treat Growth Packs as contextual learning support for the current adventure, not a generic content feed. Reading, course consumption or opening a suggestion earns no progress without real-world application and evidence.
- Do not simulate persistence, AI, authorization, progress, achievements, social activity, or completed product capabilities.
- Keep domain logic independent of framework and infrastructure details.
- Treat accessibility, privacy, security, observability, navigation recovery, mobile usability, and tests as part of each slice.
- Update the implementation ledger and status with every coherent change.
- Run `npm run validate` before declaring a stage complete.
- Stop at a stage boundary unless the execution command explicitly authorizes the next stage.

## Drift check required before completion

For every Builder-facing change, explicitly verify:

1. Does this feel like continuing a real-life adventure rather than operating software?
2. Is one meaningful next move obvious?
3. Does action create a truthful visible consequence, progression, unlock, reveal, or stronger evidence-backed identity?
4. Is reading secondary to doing?
5. Are choices and pivots possible where human development reasonably requires them?
6. Are prior proof and growth preserved when direction changes?

If any applicable answer is no, the work is not PipuPath-complete.
