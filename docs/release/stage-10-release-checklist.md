# Stage 10 release checklist

## Code and data

- [ ] Clean Stage 10 branch based on the verified Stage 9 head
- [ ] No unrelated or banned feature work
- [ ] Formatting, lint, TypeScript, coverage, integration, database and build pass
- [ ] Stage 10 migration applied and verified on authorised staging only
- [ ] Generated schema/RPC contract reconciled
- [ ] RLS and anonymous boundaries rerun

## Experience

- [ ] Landing communicates PipuPath in five seconds
- [ ] Email authentication passes
- [ ] Live Google OAuth passes with approved staging account
- [ ] Fresh-user and returning-user progression pass
- [ ] Home, Journey, Build, Portfolio and Profile navigation pass
- [ ] Every visible control is active or removed
- [ ] Loading, empty, error, retry and 404 states pass
- [ ] Mobile/tablet/desktop and keyboard/reduced-motion checks pass
- [ ] Browser console and runtime error review is clean

## Release candidate

- [ ] One exact Git head
- [ ] One matching READY Vercel Preview
- [ ] Matching staging database
- [ ] Complete authenticated browser matrix
- [ ] Portfolio 200 → 404 → 200 lifecycle reconfirmed
- [ ] Environment/OAuth/Gemini/Vercel documentation complete
- [ ] Known debt classified
- [ ] Rollback plan reviewed
- [ ] Production remains untouched until deliberate approval
