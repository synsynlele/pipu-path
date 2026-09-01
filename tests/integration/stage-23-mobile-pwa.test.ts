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
  it("presents five human destinations while preserving deep product routes beneath them", () => {
    for (const label of ["Home", "Discover", "Build", "Connect", "Profile"]) {
      expect(navigation).toContain(`label: "${label}"`);
    }
    expect(navigation).toContain("grid-cols-5");
    expect(navigation).toContain('pathname.startsWith("/journey")');
    expect(navigation).toContain('pathname.startsWith("/portfolio")');
    expect(navigation).toContain('pathname.startsWith("/opportunities")');
  });

  it("keeps Home and Discover action-led instead of introducing an infinite social feed", () => {
    expect(home).toContain("nextMove(");
    expect(home).toContain("Your next move");
    expect(home).toContain("Your momentum");
    expect(home).toContain("requireAuthenticatedHomeState");
    expect(discover).toContain("Useful, bounded, no endless feed.");
    expect(discover).toContain("requireAuthenticatedHomeState");
    expect(home).not.toContain("infinite-scroll");
    expect(discover).not.toContain("infinite-scroll");
  });

  it("makes the same web product installable without caching private Builder state", () => {
    expect(manifest).toContain('display: "standalone"');
    expect(manifest).toContain('start_url: "/continue"');
    expect(manifest).toContain('src: "/pwa/icon-192"');
    expect(manifest).toContain('src: "/pwa/icon-512"');
    expect(installPrompt).toContain("beforeinstallprompt");
    expect(proxy).toContain('"/discover"');
    expect(proxy).toContain("manifest.webmanifest");
    expect(installPrompt).not.toContain("caches.open");
    expect(installPrompt).not.toContain("serviceWorker.register");
  });
});
