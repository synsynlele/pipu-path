# PipuPath Lite — Android

PipuPath Lite is the lightweight Android distribution of the existing PipuPath
web/PWA product. It uses a Trusted Web Activity (TWA), so the Android package
launches the production PipuPath origin in a fullscreen, app-like surface while
the existing Next.js, Supabase, authentication and product logic remain the
single source of truth.

## Why TWA

- Keeps the Android binary small.
- Preserves browser-grade authentication, including Google sign-in.
- Does not fork or duplicate PipuPath backend/domain logic.
- Lets most product updates ship through the existing web deployment.
- Supports normal Android launcher identity, splash behavior and deep links.
- Can later be distributed directly as an APK or through Google Play.

## Current development package

- Display name: `PipuPath Lite`
- Development package ID: `ng.name.pipupath.lite.dev`
- Production origin: `https://www.pipupath.name.ng`
- Start route: `/continue`
- Minimum Android API: 21
- Orientation: portrait-primary
- Bubblewrap toolchain: `1.25.0`

The committed development signing key is deliberately scoped to the `.dev`
package only. It exists so CI can create repeatable installable preview builds
and so Digital Asset Links can verify the preview TWA. It must never be reused
for the public production package.

## Build

GitHub Actions runs `.github/workflows/android-lite.yml`. On a relevant push it:

1. verifies the live PWA manifest contract;
2. generates an Android project from `twa-manifest.json`;
3. builds a signed development APK and AAB with Bubblewrap;
4. publishes both files as a GitHub Actions artifact.

## Production signing

Before public distribution, create a private release keystore for the permanent
package ID `ng.name.pipupath.lite`. Store that key outside the repository and in
the release CI secret store. Add its SHA-256 certificate fingerprint to
`public/.well-known/assetlinks.json`, then change the TWA manifest package ID and
signing configuration for the production release.

Do not commit the production keystore or its passwords.
