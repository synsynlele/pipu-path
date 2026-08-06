# PipuPath project state

**Current stage:** Stage 11 — Builder Connect and Renewable Growth Cycles

**Stage status:** IMPLEMENTATION CANDIDATE — DATABASE, CI AND PREVIEW VERIFICATION PENDING

**Completed stages:** Stage 0 through Stage 10

**Current Git baseline:** `main` at
`00a03b670b8125cdffcb65f0570119380a355040`

**Review surface:** GitHub pull request #19 on
`agent/stage11-builder-connect`

**Infrastructure:** authorised Supabase staging
`kvjcswnmhwegpakbtvlh`; production changes remain gated behind an exact
Preview and critical-path verification

**Last updated:** 2026-08-06

## Stage 11 product decision

Stage 11 restores the Network part of the original PipuPath operating system
and removes the completed-Project dead end. It is one bulk vertical slice, not a
sequence of disconnected releases.

The implementation candidate includes:

- a sixth authenticated destination, Connect, on desktop and mobile;
- adult-only, deliberate opt-in Builder discovery;
- allow-listed Builder cards and authenticated Builder details;
- incoming, sent and accepted connection workflows;
- cancel, accept, decline and remove transitions;
- blocking, reporting and privacy controls;
- explicit per-connection contact sharing, with no unrestricted messaging;
- database-enforced age, safeguarding, visibility and blocking rules; and
- renewable Builder growth cycles after a Journey and its Project are both
  completed.

## Renewable growth loop

A completed Project no longer means the Builder has finished PipuPath. The
progression becomes:

`Journey → Quests → Project → proof/reflection → next Journey cycle`

A continuation Journey is permitted only after the prior Journey and its
Project are completed. It receives a new cycle number and a fresh bounded
generation budget, while retaining a link to the prior Journey. Portfolio
publication remains optional and adult-only; it does not block continued growth.

## Stage boundary

Stage 11 does not add chat, direct messages, feeds, followers, likes, comments,
rankings, open contact exposure, minors' discovery, teams, opportunities,
payments, employment or marketplace behavior.

## Release gate

Stage 11 is complete only when:

1. migrations `202608060022` and `202608060023` are applied and structurally
   verified on the authorised database;
2. RLS, grants, function execution boundaries and safeguarding predicates pass;
3. formatting, lint, strict TypeScript, targeted unit/integration tests and the
   production build pass on the exact application head;
4. the matching Vercel Preview is READY;
5. critical authenticated Connect and next-Journey paths pass; and
6. the exact verified release is merged and production deployment is healthy.
