# Stage 2.6 external verification

**Target:** `kvjcswnmhwegpakbtvlh` (`pipupath-staging`, `eu-west-1`)  
**Classification:** Dedicated disposable non-production staging  
**Authorization:** Reset, delete, migrate and deterministic test accounts
approved by the owner on 2026-07-24  
**Status:** IN PROGRESS

The project began with zero public tables, users and policies. The first
migration passed a rollback dry run and then applied. Remote catalog inspection
found Supabase default table and function privileges broader than the intended
contract. Two append-only hardening migrations removed them.

Current evidence:

- Three migrations recorded remotely in order.
- Five private tables have RLS.
- Anonymous/public table grants: zero.
- Public views: zero.
- Security-definer functions have only explicit required execution roles.
- Anonymous profile and controlled-RPC API probes return `42501`.
- Remote types generated successfully and strict TypeScript passes.
- pgTAP: 19/19 assertions passed.
- Two approved email signups succeeded with no pre-confirmation session.
- Confirmation, recovery, OAuth and full browser E2E remain pending.

No profile content has been inspected or disclosed.
