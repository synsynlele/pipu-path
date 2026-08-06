# Stage 11 release checklist

## Scope integrity

- [x] Branch is based on the current production-aligned `main` head.
- [x] Connect and renewable Journey cycles ship together in one release.
- [x] No messaging, minors' discovery, feed or marketplace behavior exists.

## Database

- [x] Enum migration `202608060022` is applied before the dependent migration.
- [x] Migrations `202608060023` through `202608060031` are applied on the authorised database.
- [x] All five Connect tables have RLS enabled.
- [x] Authenticated direct table access is SELECT-only and policy-constrained.
- [x] Anonymous and PUBLIC function execution is denied.
- [x] Adult eligibility, safeguarding, visibility and blocking predicates pass.
- [x] Continuation requires completed Journey and completed Project.
- [x] Supabase security and performance advisors have no unresolved Stage 11
      critical finding.

## Application

- [x] Desktop and mobile navigation contain Connect.
- [x] Private profile is the default.
- [x] Discoverable cards show only allow-listed fields.
- [x] Send, cancel, accept, decline and remove are implemented; database transitions pass.
- [x] Block, unblock and report are implemented with server-owned boundaries.
- [x] Contact sharing requires accepted connection and explicit channel consent.
- [x] A completed growth cycle offers the next Journey.
- [x] Portfolio remains optional.

## Critical validation

- [ ] Format check.
- [ ] Zero-warning lint.
- [ ] Strict TypeScript.
- [ ] Connect domain tests.
- [ ] Journey continuation tests.
- [ ] Stage 11 structural integration tests.
- [ ] Production build.
- [ ] Matching Preview READY.
- [ ] Authenticated desktop/mobile Connect smoke path.
- [ ] Continuation Journey smoke path.

## Release

- [ ] Exact branch head recorded.
- [ ] Exact Preview recorded.
- [ ] PR approved and merged without unrelated changes.
- [ ] Production deployment READY.
- [ ] Health, authentication and protected-route checks pass.
