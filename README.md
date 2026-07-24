# PipuPath

PipuPath is a human-development operating system that connects discovery,
development, evidence, collaboration, deployment, and impact.

This repository currently contains the completed Stage 0–1 engineering
foundation. It intentionally contains no simulated users, journeys, quests,
profiles, projects, recommendations, or impact records.

## Prerequisites

- Node.js 24.x
- npm 11.x

## Local development

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Quality gates

```bash
npm run validate
```

The validation pipeline checks formatting, linting, types, unit/component test
coverage, and the production build.

## Repository map

- `docs/engineering` — Constitution, stage plan, and decision records
- `docs/architecture` — system boundaries and dependency rules
- `docs/implementation` — current status and append-only implementation ledger
- `src/app` — route composition and application entry points
- `src/components` — application shells and design-system primitives
- `src/lib` — environment and logging foundations

Read `AGENTS.md` before implementing a new stage.
