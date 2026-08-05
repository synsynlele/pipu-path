# PipuPath

**PipuPath is the University for Human Potential.** It helps people discover who
they are, develop what they carry and deploy it through real-world action.

The MVP includes private Identity and consent, 15-question Discovery, a Human
Potential Profile, Practical Mission, Builder Journey, HQLS Quests with evidence
and Nortnspoil reflection, one Builder Project and a selective adult public
Portfolio. Stage 10 hardens and integrates this complete loop for launch; it
does not add social, marketplace or opportunity features.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres/Storage,
server-only Google Gemini, Playwright, Vitest, GitHub Actions and Vercel.

## Local development

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:3000`. Supabase and Gemini values are required for the
corresponding live flows. Read `docs/runbooks/google-oauth.md` before testing
Google authentication.

## Quality gates

```bash
npm run validate
npm run db:test
npm run test:e2e
```

`npm run validate` checks formatting, zero-warning lint, strict TypeScript,
coverage, structural integration and the production build. Database and browser
gates require the authorised local/staging environment and are never reported as
passed when skipped.

## Release

Read:

- `AGENTS.md`
- `PROJECT_STATE.md`
- `docs/engineering/constitution.md`
- `docs/architecture/adr-stage-10-mvp-launch-readiness.md`
- `docs/release/stage-10-release-checklist.md`
- `docs/release/stage-10-rollback-plan.md`
- `docs/release/stage-10-known-debt.md`

Production is not changed until an exact Preview and matching staging matrix are
approved.
