<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes â€” APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PipuPath engineering rules

Read these files before implementation:

1. `docs/engineering/constitution.md`
2. `docs/architecture/system-overview.md`
3. `docs/implementation/status.md`
4. The stage document relevant to the next incomplete stage

Non-negotiable rules:

- Build complete vertical slices in stage order.
- Do not simulate persistence, AI, authorization, progress, or completed product capabilities.
- Keep domain logic independent of framework and infrastructure details.
- Treat accessibility, privacy, security, observability, and tests as part of each slice.
- Update the implementation ledger and status with every coherent change.
- Run `npm run validate` before declaring a stage complete.
- Stop at a stage boundary unless the execution command explicitly authorizes the next stage.
Ÿ®8