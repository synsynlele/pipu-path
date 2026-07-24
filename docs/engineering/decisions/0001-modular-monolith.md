# ADR 0001: Start as a modular monolith

- Status: Accepted
- Date: 2026-07-24

## Decision

Use one Next.js deployable with capability modules and inward dependency rules.

## Rationale

PipuPath’s developmental loop crosses many capabilities. A modular monolith
keeps early delivery and transactions coherent without sacrificing explicit
domain boundaries. Distribution is deferred until measured scaling,
organizational, or regulatory pressure justifies it.
