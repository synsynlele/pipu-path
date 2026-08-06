# System architecture overview

## Architectural shape

PipuPath begins as a modular monolith. This keeps cross-capability workflows
transactionally coherent while preserving boundaries that can be separated if
scale or regulation later requires it.

```text
Route composition
  -> Application use cases
    -> Domain models and policies
      -> Ports
        -> Infrastructure adapters
```

Dependencies point inward. Domain and application code may not import Next.js,
database SDKs, AI SDKs, analytics SDKs, or transport-specific types.

## Product capability boundaries

- Identity and safeguarding
- Potential signals and discovery
- Journeys and HQLS Quests
- Evidence and reflection
- Human Potential Profile
- Projects and deployment
- Builder network and collaboration
- Outcomes, impact, and opportunities
- Operations, moderation, and audit

Every boundary owns its terminology, rules, persistence contract, and emitted
events. Cross-boundary reads use explicit application queries; cross-boundary
changes use application commands and recorded events.

## Stage 1 structure

- `src/app`: Next.js route composition; Server Components by default
- `src/components`: framework-facing shells and design-system primitives
- `src/lib/config`: server environment parsing and validation
- `src/lib/observability`: structured, redacted logging boundary
- `docs`: architecture authority and delivery evidence

Future stages add `src/modules/<capability>/{domain,application,infrastructure}`
without moving domain rules into route files.

## Data and intelligence rules

- Persistent entities use stable identifiers, timestamps, explicit status
  transitions, and optimistic concurrency where concurrent edits are possible.
- Derived profile claims retain links to source evidence and synthesis version.
- AI output is untrusted input: schema-validated, provenance-recorded, bounded,
  and reviewable by the user.
- Logs never contain secrets, raw assessment narratives, contact details, or
  protected youth data.
- Destructive transitions require authorization, auditability, and a defined
  recovery or retention policy.

## Deployment posture

The web application is a single deployable unit in early stages. External
services are introduced only by the stage that needs them and behind ports.
CI is the authoritative merge gate.

## Stage 11 composition

`src/modules/connect` owns the adult-safe discovery, relationship, blocking,
reporting and contact-consent contracts. Routes compose those use cases but do
not authorize cross-user state themselves. Supabase RLS and controlled RPCs
remain authoritative.

Journey continuity stays inside the Journey boundary. Cycle lineage is stored on
generation requests and Journeys, while completed Project state is read as the
proof gate. Connect and Journey do not share persistence or mutate each other;
they compound through the authenticated Home and progression resolver.

