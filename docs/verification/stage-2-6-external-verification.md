# Stage 2.6 external verification

**Target:** `kvjcswnmhwegpakbtvlh` (`pipupath-staging`, `eu-west-1`)  
**Classification:** Dedicated disposable non-production staging  
**Authorization:** Reset, delete, migrate and deterministic test accounts
approved by the owner on 2026-07-24  
**Status:** BLOCKED

The project began with zero public tables, users and policies. The first
migration passed a rollback dry run and then applied. Remote catalog inspection
found Supabase default table and function privileges broader than the intended
contract. Two append-only hardening migrations removed them.

Current evidence:

- Three migrations recorded remotely in order and replayed from an empty
  transactional schema.
- Five private tables have RLS.
- Anonymous/public table grants: zero.
- Public views: zero.
- Security-definer functions have only explicit required execution roles.
- Anonymous profile and controlled-RPC API probes return `42501`.
- Remote types generated successfully and strict TypeScript passes.
- pgTAP: 19/19 assertions passed.
- Two approved email signups and confirmations succeeded.
- Login-before-confirmation rejection, login-after-confirmation, two-user
  isolation, approved updates, protected-column denial, checkpoint persistence,
  refresh, invalid credentials, duplicate signup, service role and logout
  passed in a 19-check API suite.
- Recovery link generation, callback verification, password update,
  invalid-link rejection and password restoration passed.
- Actual recovery-email delivery is blocked by the hosted built-in provider's
  two-emails-per-hour quota after the two signup messages.
- Google configuration and OAuth initiation passed and redirect to
  `accounts.google.com`; callback completion remains unexecuted.
- Production HTTP smoke passed, but Playwright's Chromium artifact could not be
  downloaded, so browser E2E remains unexecuted.
- The staging application is deployed at `https://pipu-path.vercel.app`.
  Deployed anonymous routes and protected redirects passed. Live browser
  verification exposed dynamic public-environment lookup that Next.js could
  not inline; the implementation now uses explicit `NEXT_PUBLIC_*` references
  and has regression coverage. Redeployment verification remains pending.
- Server secrets were not found in tracked files or browser bundles.

No profile content has been inspected or disclosed.

Stage 2 cannot close while recovery-email delivery, Google OAuth completion and
browser E2E remain unverified.
