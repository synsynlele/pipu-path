import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const layout = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
const manifest = readFileSync(join(root, "src/app/manifest.ts"), "utf8");
const twaManifest = readFileSync(
  join(root, "android-lite/twa-manifest.json"),
  "utf8",
);
const productionTwaManifest = readFileSync(
  join(root, "android-lite/twa-manifest.production.json"),
  "utf8",
);

describe("PipuPath brand icon consistency", () => {
  it("uses static canonical PipuPath logo assets for browser and Apple metadata", () => {
    expect(layout).toContain('url: "/brand/pipupath-icon-192.png"');
    expect(layout).not.toContain('url: "/icon.svg"');
    expect(existsSync(join(root, "src/app/icon.svg"))).toBe(false);
    expect(existsSync(join(root, "src/app/apple-icon.tsx"))).toBe(false);
  });

  it("uses the same canonical static icon assets in the PWA manifest", () => {
    expect(manifest).toContain('src: "/brand/pipupath-icon-192.png"');
    expect(manifest).toContain('src: "/brand/pipupath-icon-512.png"');
    expect(existsSync(join(root, "public/brand/pipupath-icon-192.png"))).toBe(
      true,
    );
    expect(existsSync(join(root, "public/brand/pipupath-icon-512.png"))).toBe(
      true,
    );
  });

  it("keeps Android Lite launcher icons on the canonical 512px asset", () => {
    const canonicalUrl =
      '"iconUrl": "https://www.pipupath.name.ng/brand/pipupath-icon-512.png"';
    const canonicalMaskableUrl =
      '"maskableIconUrl": "https://www.pipupath.name.ng/brand/pipupath-icon-512.png"';

    expect(twaManifest).toContain(canonicalUrl);
    expect(twaManifest).toContain(canonicalMaskableUrl);
    expect(productionTwaManifest).toContain(canonicalUrl);
    expect(productionTwaManifest).toContain(canonicalMaskableUrl);
  });

  it("does not keep a second runtime-generated icon implementation", () => {
    expect(existsSync(join(root, "src/lib/pwa/render-icon.ts"))).toBe(false);
    expect(existsSync(join(root, "src/app/pwa/icon-192/route.ts"))).toBe(false);
    expect(existsSync(join(root, "src/app/pwa/icon-512/route.ts"))).toBe(false);
  });
});
