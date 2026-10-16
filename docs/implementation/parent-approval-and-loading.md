# Parent approval and loading — 16 October 2026

The owner requested less friction for young people doing private missions and
identified slow page loads and responses. The chosen approval method is a parent
checkbox on the young person's account, without a separate parent login.

## Resulting experience

After identity setup, under-18 users hand their device to a parent or legal
guardian. That adult enters their name, selects the relationship and explicitly
checks a declaration that they are 18 or older and approve private learning under
the Terms and Privacy Notice. The box starts unchecked. The form waits for the
consent record to save before continuing; failure keeps the user on the form.

The existing append-only `user_consents` ledger stores the declared name,
relationship, policy version, timestamp, scope and the authenticated account that
recorded it. The distinct `parent_declared` status means self-declared approval;
it does not claim independently verified adult identity. No guardian account is
invented. The Account and privacy page offers withdrawal, which pauses private
learning without deleting existing work. The profile links to these controls.

Independently authenticated guardian approval remains available through `/guardian`
for school-network permissions. A saved parent declaration does not satisfy the
existing database helper for that stronger approval. External AI remains disabled
for minors; public networking remains adult-only and school-network restrictions
are unchanged. This change does not establish that a checkbox alone meets every
applicable age/parental-consent verification obligation.

## Performance changes and evidence

Identity and guardian reads use React's request-scoped `cache`, shared by layouts,
pages and access gates. Dashboard reads reuse the same identity rather than
making another authentication/profile/checkpoint round trip. Repeated home-state
loads also share a result within one request. Auth callbacks with a newly
supplied client still read fresh state. No persistent or cross-user identity
cache is introduced.

The request-boundary test uses the installed React server cache implementation:
parallel identity plus two gate calls produce one `auth.getUser`, two table reads
(profile/checkpoint) and one guardian RPC. Starting a new request reads identity
again and does not expose the previous user.

OpenAI structured responses now have one 45-second total timeout budget including
retry delay. A fast transient failure can still retry using the remaining budget;
a full timeout cannot start a second 45-second wait. Existing validated fallbacks
and module error handling remain in place. This is a worst-case wait bound, not a
measurement of normal production response speed.

## Verification and release

An embedded PostgreSQL integration test runs the actual initial identity/grant
migrations, guardian table/helper/read function and new migration with an auth
session shim. It verifies anonymous/direct-write denials, explicit approval,
relationship and account validation, idempotency, ownership, withdrawal/reapproval
and absence of independent guardian or school-network authorization. It is not a
full hosted Supabase or browser end-to-end test.

The previously verified PipuPath project reference is `kvjcswnmhwegpakbtvlh`.
The current connector cannot access that project. The connected KHPOS database was
checked read-only and has no PipuPath guardian tables; no changes were applied to
it. The current Vercel connector omits sensitive environment values, including the
public Supabase URL, so current production binding still needs verification.

Before release, restore access to PipuPath's database, verify its binding against
production, apply the new migration, and exercise parent approval, returning-user
access and withdrawal on a disposable account. Apply the database migration before
the frontend deployment. Existing independently approved accounts remain valid.
Measure signed-in mission/dashboard loading and AI response time after deployment;
no live speed improvement or production deployment is claimed by local tests.
