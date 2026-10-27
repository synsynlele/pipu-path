# Google OAuth staging and production runbook

## Application configuration

Set `NEXT_PUBLIC_APP_URL` to the canonical environment URL. Set the Supabase URL
and anonymous key for the same environment. The callback route is:

`<application-origin>/auth/callback`

PipuPath passes this callback as `redirectTo`; Supabase Auth URL Configuration
must therefore allow the exact canonical callback and the approved Vercel
Preview pattern. Use a narrow Preview wildcard owned by this project, not an
unrestricted external wildcard.

## Google Cloud configuration

The Google OAuth client's authorised redirect URI is the Supabase project Auth
callback shown by the Supabase Google provider configuration. It is not each
Vercel application callback. Configure the approved staging test account while
the consent screen remains in testing mode.

## PipuPath game preview: returning to the same domain

The cinematic Adventure Hub is deployed on the stable Git preview alias:

`https://pipu-path-git-feat-unbuilt-cit-3cc555-copyartint-2860s-projects.vercel.app`

The callback for this branch is:

`https://pipu-path-git-feat-unbuilt-cit-3cc555-copyartint-2860s-projects.vercel.app/auth/callback?next=%2Fbuild%2Fadventures`

If signing in from this preview lands on `www.pipupath.name.ng` instead,
check **Supabase Dashboard → PipuPath project → Authentication → URL Configuration**
and add the **additional Redirect URL**:

`https://pipu-path-git-feat-unbuilt-cit-3cc555-copyartint-2860s-projects.vercel.app/auth/callback**`

The final `**` accepts safe in-app `next` query strings. Keep the existing
production **Site URL** unchanged. Never replace it with a preview URL.

The Google Cloud OAuth client itself should continue using the existing
`https://<project-ref>.supabase.co/auth/v1/callback` authorised redirect URI;
the Vercel preview belongs in **Supabase Redirect URLs**, not in Google's
authorised redirect list.

After saving, open the **stable branch alias** above in a fresh browser session,
visit `/build/adventures`, choose Google sign-in, and confirm that the browser
returns to that same preview host, not production. Also verify that a user who
has not finished onboarding is sent to the required onboarding step. The user
should not have to register a new account.

When testing an immutable per-commit Vercel deployment URL instead of the branch
alias, the exact callback host differs; add it separately or use a narrow
project-owned Vercel preview wildcard. Do not use an unrestricted
`https://**.vercel.app/**` wildcard.

## Required verification

1. Open the exact Stage 10 Preview with no PipuPath session.
2. Choose **Continue with Google**.
3. Select the approved staging Google account.
4. Confirm the browser returns through `/auth/callback`.
5. Confirm a new account reaches Identity setup.
6. Confirm an incomplete account reaches its first incomplete stage.
7. Confirm a completed account reaches authenticated Home.
8. Refresh, sign out and sign in again; confirm the same durable state.
9. Check callback/runtime logs for privacy-safe completion and no redirect loop.
10. Repeat email authentication separately.

Never record Google credentials, OAuth codes, access tokens or session cookies in
logs, screenshots, issues or fixtures.
