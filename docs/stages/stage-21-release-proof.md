# Stage 21 — Builder Passport/API release proof

**Stage:** 21 — Builder Passport/API  
**Status:** Release candidate — static, Supabase and browser gates passed; final clean-head CI/merge/production remain  
**Date:** 2026-08-18

## Static gate — passed

The implemented Stage 21 application passed complete repository validation before database deployment, and the post-Preview runtime correction passed complete validation again in CI #1003 on `485f34e4aeb498320fa5b648cbd41be035a7a34d`.

Current corrected test baseline includes:

- repository formatting;
- zero-warning lint;
- strict TypeScript;
- 56 unit-test files / 287 unit tests;
- all global coverage thresholds without lowering or excluding any threshold;
- full Stage 0–21 integration/regression suite;
- production build.

Focused tests cover cryptographic share-secret handling, hash-only persistence, authenticated-owner/service-role DAL separation, fail-closed server actions, fragment-to-bearer public verification, exact issuance consent, dependent-proof removal, adult eligibility, and Supabase/PostgreSQL offset-aware timestamps.

## Supabase migration ledger — passed

Authorised project: `kvjcswnmhwegpakbtvlh`.

Live Stage 21 migrations:

- `20260818173546_stage_21_builder_passport_api`
- `20260818173828_index_stage_21_builder_passport_foreign_keys`

Repository migration filenames are reconciled to those exact remote versions.

## Database security/performance boundary — passed

Live verification confirms:

- RLS on all eight Stage 21 Passport tables;
- no direct `anon` or `authenticated` table CRUD;
- only `service_role` has direct table privileges;
- share storage contains `secret_hash`, with no raw secret column;
- Builder workspace/issue/share lifecycle RPCs are authenticated boundaries;
- `resolve_stage21_passport_share(uuid,text)` and `consume_stage21_passport_rate_limit(text,integer,integer)` are service-role-only;
- the two Stage 21 composite foreign keys have covering indexes.

## Rollback-only lifecycle proof — passed

A live transaction proved:

1. exact eligible capability/evidence exposure with no private `sourceHref`;
2. Passport v1 issuance through the real owner RPC;
3. immutable snapshot enforcement;
4. hash-only share persistence;
5. wrong bearer rejection and correct bearer resolution/access count;
6. durable rate limiting;
7. live Portfolio integrity when published;
8. integrity downgrade plus `proofHref=null` after source withdrawal;
9. share revocation;
10. Passport v2 supersession automatically closing an outstanding v1 share;
11. Passport revocation;
12. privacy-safe resolution audit.

The transaction rolled back. Post-proof verification showed zero test Passport/share/audit/profile residue and restored the borrowed Portfolio source to `published`.

## First deliberate Preview — defect discovery

Preview `dpl_3J1qNifcBfHK4pJCsiuSUucQ2aFu` was READY from exact SHA `55b6074f25600db7df0ec08e94ea95394bdaade5`.

The browser proof passed:

- anonymous private Passport workspace denial;
- invalid bearer API and public-shell fail-closed behavior.

The authenticated `/passport` step failed. Vercel runtime logs showed `PASSPORT_WORKSPACE_INVALID`.

Live RPC inspection proved the workspace data itself was correct; the mismatch was timestamp validation. PostgreSQL/Supabase emitted offset-aware strings such as `2026-08-13T11:44:37.334053+00:00`, while the initial Stage 21 Zod contract accepted only the stricter UTC form.

The branch immediately restored Vercel suppression before correction work.

## Runtime correction — passed

Stage 21 introduced a shared offset-aware timestamp schema and applied it to both private workspace and public Passport projections. Unit/DAL regressions use the exact PostgreSQL `+00:00` microsecond format from the failed Preview.

Full CI #1003 passed on corrected head `485f34e4aeb498320fa5b648cbd41be035a7a34d`.

## Corrective Preview — passed

Corrective Preview `dpl_FwvJdLM1ZQT1zcdgLU3zShLGztu7` was READY from exact source `ecb8f16f027b4ac7e8ae10d458391fc04ac8ee34`.

Stage 21 Final Preview Proof run `32170096576` passed completely:

- anonymous `/passport` denial;
- invalid bearer API returns generic unavailable response with no-store/noindex;
- invalid public share shell shows the same generic unavailable boundary;
- authenticated Builder opens `/passport` successfully using live offset-aware workspace timestamps;
- exact capability/evidence selection and explicit consent issue a Passport;
- one-time `#secret` share creation succeeds;
- direct bearer API resolves only the allow-listed `builder-passport.v1` projection;
- fresh anonymous browser resolves the same share and removes the fragment from browser history;
- contact/HPP/reflection/private source fields are absent from public output;
- Builder revokes the share and the bearer then receives unavailable;
- Builder revokes the Passport.

No failure traces were produced because the corrective browser proof passed.

## Release cleanup — passed

Immediately after the successful corrective proof:

- Vercel Preview suppression was restored;
- temporary Preview workflow was removed;
- six release audit events were removed;
- one release share was removed;
- the exact release Passport version was removed;
- three Stage 21 rate-limit buckets created across the two Preview attempts were removed;
- the CI Builder display name was restored to its original `null` value.

Final live verification shows:

- 0 fixture Passport versions;
- 0 fixture shares;
- 0 fixture Passport events;
- 0 release rate-limit rows;
- CI Builder display name `null`.

## Preview-commit CI note

The deployable Preview commit intentionally omits `vercel.json` to permit one Vercel build. Its normal CI therefore fails the Stage 20/21 structural tests that require branch suppression to exist. This is expected and does not represent an application regression. The browser proof runs against that deployable commit; the merge candidate always restores `vercel.json`, removes the temporary workflow, and must pass the complete final CI gate.

## Remaining release gate

1. final restored-suppression head passes complete CI;
2. PR #37 is intentionally squash-merged;
3. production Vercel reaches READY on the exact merge commit;
4. canonical production health and runtime error logs are verified.
