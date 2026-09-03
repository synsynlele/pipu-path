import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const renderIcon = readFileSync(
  join(root, "src/lib/pwa/render-icon.ts"),
  "utf8",
);
const layout = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
const manifest = readFileSync(join(root, "src/app/manifest.ts"), "utf8");
const twaManifest = readFileSync(
  join(root, "android-lite/twa-manifest.production.json"),
  "utf8",
);

describe("PipuPath brand icon consistency", () => {
  it("uses the canonical in-app PipuPath logo for generated app icons", () => {
    expect(renderIcon).toContain("PIPUPATH_LOGO_DATA_URI");
    expect(renderIcon).not.toContain('"P",');
  });

  it("uses the generated canonical icon for browser and Apple metadata", () => {
    expect(layout).toContain('url: "/pwa/icon-192"');
    expect(layout).toContain('url: "/apple-icon"');
    expect(layout).not.toContain('url: "/icon.svg"');
    expect(existsSync(join(root, "src/app/icon.svg"))).toBe(false);
  });

  it("keeps PWA and Android Lite launcher icons on the same source", () => {
    expect(manifest).toContain('src: "/pwa/icon-192"');
    expect(manifest).toContain('src: "/pwa/icon-512"');
    expect(twaManifest).toContain(
      '"iconUrl": "https://www.pipupath.name.ng/pwa/icon-512"',
    );
  });
});
