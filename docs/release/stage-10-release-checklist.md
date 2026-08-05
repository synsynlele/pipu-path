# Stage 10 release checklist

## Code and data

- [x] Clean Stage 10 branch based on the verified Stage 9 head
- [x] No unrelated or banned feature work
- [x] Formatting, lint, TypeScript, coverage, integration and build pass
- [x] Stage 10 migrations recorded and verified on authorised staging only
- [x] Generated schema/RPC contract reconciled
- [x] RLS and anonymous boundaries rerun

## Experience

- [x] Landing communicates PipuPath in five seconds
- [x] Approved PipuPath logo is installed in the public and authenticated shells
- [x] Approved PipuPath favicon is installed in browser metadata
- [x] Email authentication passes
- [x] Live Supabase → Google handoff uses the exact environment callback
- [ ] Approved user completes Google account selection and callback session
- [x] Fresh-user and returning-user progression logic passes
- [x] Home, Journey, Build, Portfolio and Profile navigation pass
- [x] Every audited visible control is active or removed
- [x] Loading, empty, error, retry and 404 states pass
- [x] Mobile/tablet/desktop, focus and reduced-motion checks pass
- [x] Browser console and runtime error review is clean

## Final release candidate

- [x] Exact Git head: `bb08c5271ea8e5076f08933eb1dd7ae34eb47bfb`
- [x] Matching READY Vercel Preview: `dpl_DgaeCn3Qr5goFVUWHH5AxiMC4Udb`
- [x] GitHub Actions run `31016406247` passes validation and authenticated E2E
- [x] Matching staging database
- [x] Complete authenticated browser recovery matrix
- [x] Portfolio 200 → 404 → 200 lifecycle reconfirmed
- [x] Environment/OAuth/Gemini/Vercel documentation complete
- [x] Known debt classified
- [x] Rollback plan reviewed
- [x] Exact Preview runtime has no warning, error or fatal logs
- [x] Production remains untouched until deliberate approval

## Final manual approval

Use the exact Preview linked from PR #13:

1. Open **Sign in** and choose **Continue with Google**.
2. Select an approved Google account.
3. Confirm the browser returns to the same Preview hostname.
4. Confirm the account reaches identity setup, its next incomplete stage or authenticated Home.
5. Refresh once and confirm the session persists.
6. Sign out and confirm the private application is no longer accessible.

Record the result in PR #13. A successful result completes Stage 10 and permits
production promotion; a failure blocks launch and must be repaired on Preview
first.
