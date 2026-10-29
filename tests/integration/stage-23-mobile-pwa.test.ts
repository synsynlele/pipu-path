import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const navigation = read("src/components/navigation/app-navigation.tsx");
const home = read("src/app/app/page.tsx");
const discover = read("src/app/discover/page.tsx");
const manifest = read("src/app/manifest.ts");
const proxy = read("src/proxy.ts");
const installPrompt = read("src/components/pwa/install-prompt.tsx");

describe("Stage 23 social-grade mobile and PWA foundation", () => {
  it("presents three clear destinations while preserving deep product routes", () => {
    for (const label of ["Play", "Real Quests", "You"]) {
      expect(navigation).toContain(`label: "${label}"`);
    }
    expect(navigation).toContain("grid-cols-3");
    for (const path of ["/journey", "/portfolio", "/opportunities"]) {
      expect(navigation).toContain(`path.startsWith("${path}")`);
    }
  });

  it("keeps Home and Discover action-led instead of introducing an infinite social feed", () => {
    expect(home).toContain('href="/build/play"');
    expect(home).toContain('href="/real-quests"');
    expect(home).toContain("Your potential, your growth");
    expect(home).toContain("requireAuthenticatedHomeState");
    expect(discover).toContain(
      "Useful places based on your current adventure.",
    );
    expect(discover).toContain("requireAuthenticatedHomeState");
    expect(home).not.toContain("infinite-scroll");
    expect(discover).not.toContain("infinite-scroll");
  });

  it("makes the same web product installable without caching private Builder state", () => {
    expect(manifest).toContain('display: "standalone"');
    expect(manifest).toContain('start_url: "/"');
    expect(manifest).toContain('src: "/brand/pipupath-icon-192.png"');
    expect(manifest).toContain('src: "/brand/pipupath-icon-512.png"');
    expect(installPrompt).toContain("beforeinstallprompt");
    expect(proxy).toContain('"/discover"');
    expect(proxy).toContain("manifest.webmanifest");
    expect(installPrompt).not.toContain("caches.open");
    expect(installPrompt).not.toContain("serviceWorker.register");
  });
});
