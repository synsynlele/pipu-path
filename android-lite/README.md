# PipuPath Lite — Android

PipuPath Lite is the lightweight Android distribution of the existing PipuPath
web/PWA product. It uses a Trusted Web Activity (TWA), so the Android package
launches the production PipuPath origin in a fullscreen, app-like surface while
the existing Next.js, Supabase, authentication and product logic remain the
single source of truth.

## Production release

- Display name: `PipuPath Lite`
- Production package ID: `ng.name.pipupath.lite`
- Current version: read `twa-manifest.production.json` (currently `1.0.2`)
- Version code: read `twa-manifest.production.json` (currently `3`)
- Production origin: `https://www.pipupath.name.ng`
- Start route: `/continue`
- Minimum Android API: 21
- Orientation: portrait-primary
- Bubblewrap toolchain: `1.25.0`
- Latest APK: `/downloads/latest` (resolved from release metadata)
- Release metadata: `/downloads/pipupath-lite.json`

The permanent production certificate fingerprint is public and pinned in both
`twa-manifest.production.json` and `public/.well-known/assetlinks.json`.

The production keystore and passwords are deliberately **not** stored in this
repository. They are required for every future direct-download APK upgrade and
must remain protected outside Git history.

## Development package

The development package remains `ng.name.pipupath.lite.dev`. Its committed
`.dev` signing key exists only so CI can create repeatable test builds. It must
never be used for the public production package.

## Why TWA

- Keeps the Android binary small.
- Preserves browser-grade authentication, including Google sign-in.
- Does not fork or duplicate PipuPath backend/domain logic.
- Lets normal product updates ship through the existing web deployment.
- Supports normal Android launcher identity, splash behavior and deep links.
- Can later be distributed through Google Play using the same product.

## Update model

PipuPath Lite uses a web-first update model. Normal product, content and backend
changes ship through the live PipuPath deployment and therefore do not require
another APK installation.

When the Android wrapper itself changes:

1. increment `appVersionCode` in `twa-manifest.production.json`;
2. update `appVersion`;
3. build with the exact permanent production signing key;
4. verify the pinned SHA-256 certificate fingerprint;
5. replace the website APK and update `/downloads/pipupath-lite.json`;
6. users install the newer APK over the existing app without uninstalling it.

## Production release CI

`.github/workflows/android-lite-release.yml` is the protected production build
path. It expects these GitHub Actions secrets:

- `PIPUPATH_ANDROID_KEYSTORE_B64`
- `PIPUPATH_ANDROID_KEYSTORE_PASSWORD`
- `PIPUPATH_ANDROID_KEY_PASSWORD`

The workflow refuses to build if the restored key does not match the permanent
PipuPath Lite production certificate.

Never commit the production keystore or its passwords.

## Google Play readiness

The production workflow also emits a signed `.aab`. It now checks the built
APK's target SDK rather than assuming an installed SDK proves compliance.
The AAB must still be inspected and tested through Play's internal testing track.
Keep `ng.name.pipupath.lite` stable. Before the first Play release, choose the
app-signing arrangement that preserves upgrades from existing sideloaded APKs.
Add the verified Play app-signing certificate fingerprints to the production
entry in `public/.well-known/assetlinks.json`; retain the existing direct-download
fingerprint. Never substitute an upload-key fingerprint for the installed-app key.
See `docs/release/play-release-foundation.md` for the complete release gates.

## Verification builds

Run **PipuPath Lite Production Release** on the release candidate branch with
`publish=false` (the default). It verifies the signing contract and generated
APK target SDK, then uploads signed APK/AAB artifacts without committing public
download files. Inspect the AAB and test installed upgrades before publishing.
Use `publish=true` only for an approved release; the existing RELEASE_NOW push
trigger retains its publication behavior. Never download or expose signing keys.
