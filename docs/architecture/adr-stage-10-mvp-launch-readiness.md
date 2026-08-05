# ADR: Stage 10 MVP Launch Readiness

**Status:** Accepted  
**Date:** 2026-08-05  
**Stage boundary:** Stage 10 only — final MVP stage

## Context

Stages 0–9 established the complete private Builder loop and selective public
Project proof. The remaining work is not product expansion. The MVP needs one
coherent release candidate with correct authentication routing, a trustworthy
public explanation, consistent visual language, simple navigation, complete
states, accessible mobile behavior, verified security boundaries and a
repeatable release procedure.

## Decision

Stage 10 hardens and integrates the existing product. It:

- fixes Google OAuth callback, session-cookie and returning-user routing;
- gives Google and email authentication one server-owned progression resolver;
- replaces the public landing page with the University for Human Potential
  positioning;
- applies a white, royal-blue, navy and restrained-gold design system;
- simplifies authenticated navigation to Home, Journey, Build, Portfolio and
  Profile;
- creates a real-data Home and one contextual Build entry point;
- supplies loading, error, empty, retry and not-found behavior;
- audits every route and visible control;
- replaces the process-local authentication limiter with an atomic Supabase
  limiter suitable for horizontally scaled Vercel Functions;
- removes build-time Google Font fetching;
- documents configuration, privacy boundaries, debt, release and rollback; and
- creates one staging-verified release candidate.

The progression resolver orders the current user state, not the historical
stage number. An active Project therefore outranks a still-active Journey, and a
completed Project requiring Portfolio work outranks Quest continuation.

## OAuth boundary

The callback exchanges the PKCE code server-side, copies all session cookies to
the redirect response, rejects unsafe `next` destinations and derives its
origin only from the configured application URL, localhost or a Vercel Preview
hostname. Password-recovery callbacks retain their explicit reset destination.

A newly authenticated user proceeds to Identity. Returning users proceed to the
first incomplete state. Completed users proceed to authenticated Home. An
authenticated request to the public landing page, login or signup cannot fall
back to the marketing experience.

## Visual and navigation boundary

The redesign changes shared primitives and shells rather than rebuilding
verified domain flows. Mobile uses a five-item bottom navigation. Desktop uses
the same five destinations. Technical stage names, future placeholders and
competing feature links are removed from primary navigation.

## Security and operational boundary

Stage 10 preserves all RLS, ownership, consent, safeguarding, server-only Gemini
and public Portfolio allow-list controls. It does not weaken a database or
provider boundary to make a browser test pass. Production remains untouched
until the exact Preview and staging matrix pass.

## Non-goals

Stage 10 does not add Builder discovery, search, messaging, followers, likes,
comments, rankings, communities, mentors, team Projects, opportunities,
employment, funding, payments, marketplaces, new AI providers, native apps or
enterprise analytics.

## Completion condition

Stage 10 ends the MVP. It is complete only after email authentication and live
Google OAuth both enter the correct staging flow; the full Stage 0–9 loop,
returning-user recovery, mobile/accessibility, RLS and Portfolio lifecycle pass;
and one exact Git/Preview/staging release candidate is documented with rollback
and known-debt decisions.
