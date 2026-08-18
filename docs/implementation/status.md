# Implementation status

**Current stage:** Stage 20 — Opportunity Marketplace  
**Stage status:** Active implementation — product/privacy authority locked; provider + application vertical slice next  
**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API  
**Last updated:** 2026-08-18

## Released and verified stages

Stages 0–12 are complete and released. Stage 13 has its PipuPath cohort/privacy boundary verified; the final real KHP-OS cross-product pairing remains a separate integration gate. Stages 14–19 are complete and released in the PipuPath product.

Stage 19 Institution Workspace was squash-merged through PR #35 as `e2dd36bd6756492c7c89d3cddb5afee762c83082`. Its final cleaned PR head passed complete validation, its database/RLS/lifecycle proof passed, its matching authenticated Vercel Preview proof passed 2/2 checks, and production Vercel completed successfully on the release commit.

Stage 20 Opportunity Marketplace is now the active implementation stage. The already-released Curated Opportunity MVP is its seed rather than duplicate work.

Stage 21 Builder Passport/API remains planned.

## Stage 20 locked scope

The authority is `docs/stages/stage-20-opportunity-marketplace.md`.

Stage 20 will:

- add a trusted provider registry with `pending`, `approved`, `suspended` and `revoked` states;
- allow approved provider operators to manage their own opportunity drafts without self-review or self-publication;
- preserve platform review/publication authority from the Stage 18 curated supply model;
- preserve deterministic age/geography/path/capability matching while adding provider trust and evidence readiness context;
- add a Builder-controlled exact application packet with explicit pre-submission preview and consent;
- allow only selected deployment-safe capability/evidence/institution/portfolio projections into the application packet;
- create durable application states: `draft`, `submitted`, `viewed`, `shortlisted`, `accepted`, `not_selected`, `withdrawn`;
- scope provider application access to applications deliberately submitted to that provider;
- keep provider-to-Builder direct messaging, broad Builder browsing and minor submission out of scope;
- feed final deployment outcomes into future guidance without silently rewriting evidence or HPP claims.

## Existing Stage 18 seed preserved

Stage 18 already supplies:

- vetted opportunity categories;
- age and geography eligibility checks;
- pathway/capability matching;
- explainable match tiers and readiness gaps;
- save/open/external-applied/self-reported outcome state;
- admin create/review/publish/withdraw flow;
- official external URL boundary;
- RLS with no direct browser table access.

The live opportunity catalog currently has no production listing rows, so Stage 20 can extend the schema without migrating or rewriting live opportunity supply data.

## Stage 20 development control

- Branch: `agent/stage-20-opportunity-marketplace`.
- Automatic Vercel Preview deployment is disabled for the branch.
- GitHub CI is the continuous static gate.
- Supabase schema/security/lifecycle verification occurs only after the code/migration shape is coherent.
- Exactly one deliberate Vercel Preview is reserved for the final authenticated Builder/provider/admin browser proof.

## Stage 20 non-goals

No payments, escrow, contracts, payroll, fees, bidding, gig marketplace, employer/provider Builder search, open messaging, ranking, automated AI selection/rejection, marketplace recommendation sale or Stage 21 credential/API work enters Stage 20.

## Stage 20 next gate

Implement the provider/application database and domain contracts first, with browser roles denied direct table access and narrowly granted RPCs for Builder, provider and platform-admin actions. Then run full static validation before any production Supabase migration or Vercel Preview.
