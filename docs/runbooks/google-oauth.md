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
