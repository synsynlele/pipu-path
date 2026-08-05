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
- [x] Email authentication passes
- [x] Live Supabase → Google handoff uses the exact environment callback
- [ ] Approved user completes Google account selection and callback session
- [x] Fresh-user and returning-user progression logic passes
- [x] Home, Journey, Build, Portfolio and Profile navigation pass
- [x] Every audited visible control is active or removed
- [x] Loading, empty, error, retry and 404 states pass
- [x] Mobile/tablet/desktop, focus and reduced-motion checks pass
- [x] Browser console and runtime error review is clean

## Release candidate

- [x] One exact Git head
- [x] One matching READY Vercel Preview
- [x] Matching staging database
- [x] Complete authenticated browser recovery matrix
- [x] Portfolio 200 → 404 → 200 lifecycle reconfirmed
- [x] Environment/OAuth/Gemini/Vercel documentation complete
- [x] Known debt classified
- [x] Rollback plan reviewed
- [x] Production remains untouched until deliberate approval

## Final manual approval

Use the exact Preview linked from PR #13:

1. Open **Sign in** and choose **Continue with Google**.
2. Select an approved staging Google account.
3. Confirm the browser returns to the same Preview hostname.
4. Confirm a new account reaches identity setup.
5. Confirm an incomplete account reaches its next incomplete stage.
6. Confirm a completed account reaches authenticated Home.
7. Refresh once and confirm the session persists.
8. Sign out and confirm the private application is no longer accessible.

Record the result in PR #13. A successful result completes Stage 10 and permits
a deliberate production-promotion decision; a failure blocks launch and must be
repaired on Preview first.
