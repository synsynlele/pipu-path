# PipuPath Lite — Android

PipuPath Lite is the lightweight Android distribution of the existing PipuPath
web/PWA product. It uses a Trusted Web Activity (TWA), so the Android package
launches the production PipuPath origin in a fullscreen, app-like surface while
the existing Next.js, Supabase, authentication and product logic remain the
single source of truth.

## Production release

- Display name: `PipuPath Lite`
- Production package ID: `ng.name.pipupath.lite`
- Current version: `1.0.0`
- Version code: `1`
- Production origin: `https://www.pipupath.name.ng`
- Start route: `/continue`
- Minimum Android API: 21
- Orientation: portrait-primary
- Bubblewrap toolchain: `1.25.0`
- APK: `/downloads/PipuPath-Lite-1.0.0.apk`
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
