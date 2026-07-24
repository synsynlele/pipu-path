# ADR 0003: Server-first web composition

- Status: Accepted
- Date: 2026-07-24

## Decision

Use Next.js App Router with Server Components by default. Introduce Client
Components only at explicit interaction boundaries. Keep domain and application
logic framework-independent.

## Consequence

The default browser payload stays small and sensitive server concerns do not
cross into client bundles accidentally.
