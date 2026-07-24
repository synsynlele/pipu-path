# Authentication setup

The verified staging project is `kvjcswnmhwegpakbtvlh`. Email signup and
confirmation and Google OAuth are enabled. Local callback routes are
`/auth/callback` and `/reset-password`.

Migrations are append-only. Apply them in filename order, generate types with
`supabase gen types typescript --project-id <ref> --schema public`, and promote
the formatted result to `src/lib/supabase/types.ts`.

Never expose the service-role key, access token, database password or Google
client secret. Production requires separate infrastructure and callback URLs.
