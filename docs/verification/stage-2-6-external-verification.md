# Stage 2.6 external verification

**Target:** `kvjcswnmhwegpakbtvlh` (`pipupath-staging`, `eu-west-1`)  
**Classification:** Dedicated disposable non-production staging  
**Authorization:** Reset, delete, migrate and deterministic test accounts
approved by the owner on 2026-07-24  
**Status:** COMPLETE

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
- Actual recovery-email delivery, callback, new-password update, subsequent
  login and logout passed with the approved staging inbox.
- Google configuration, OAuth initiation, callback, identity provisioning,
  repeated sign-in, session restoration, logout and protected redirect passed
  with the approved Google test account.
- Production HTTP smoke passed. The E2E configuration now accepts
  `E2E_BASE_URL` and does not start a local server for staging runs. A genuine
  local staging run could not install browser executables, so the same suite
  was moved to GitHub Actions. Chromium and WebKit installed successfully and
  all four desktop/mobile staging tests passed.
- The staging application is deployed at `https://pipu-path.vercel.app`.
  Deployed anonymous routes and protected redirects passed. Live browser
  verification exposed dynamic public-environment lookup that Next.js could
  not inline; the implementation now uses explicit `NEXT_PUBLIC_*` references
  and has regression coverage. The next deployed build exposed an invalid
  nested brand link that prevented React hydration; the duplicate link wrapper
  was removed with component regression coverage. OAuth initiation was also
  moved to a server action so PKCE state and callback construction stay inside
  the server boundary. Redeployment passed.
- A real recovery email was delivered and its callback authenticated. After
  `/reset-password` was added to the controlled allowlist, a fresh link reached
  the update form and a new password was accepted. Login with the new password
  and logout both passed. Reusing the existing password was safely rejected;
  the UI now maps that provider error to an actionable non-sensitive message.
- Remote types were regenerated through the Supabase Management API on
  2026-07-24 and match the committed generated file exactly.
- Server secrets were not found in tracked files or browser bundles.

No profile content has been inspected or disclosed.

All mandatory Stage 2.6 gates have passed against confirmed staging. Stage 2 is
complete. Work stops at the Stage 3 boundary.
Ÿ®8