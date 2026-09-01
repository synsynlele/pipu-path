import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const globals = read("src/app/globals.css");
const home = read("src/app/app/page.tsx");
const discover = read("src/app/discover/page.tsx");
const appShell = read("src/components/shells/app-shell.tsx");
const publicShell = read("src/components/shells/public-shell.tsx");
const install = read("src/components/pwa/install-prompt.tsx");
const layout = read("src/app/layout.tsx");
const manifest = read("src/app/manifest.ts");

describe("Stage 24 visual fidelity and mobile installation", () => {
  it("makes the application bright-first rather than globally dark", () => {
    expect(globals).toContain("--background: #f7f8fc");
    expect(globals).toContain("color-scheme: light");
    expect(globals).toContain("--color-panel: #ffffff");
    expect(globals).not.toContain(".bg-white {\n  background-color: #07142f;");
    expect(layout).toContain('colorScheme: "light"');
    expect(layout).toContain('themeColor: "#ffffff"');
    expect(appShell).toContain("bg-white/92");
  });

  it("uses the approved social-grade interaction grammar on Home and Discover", () => {
    expect(home).toContain("Your path");
    expect(home).toContain("Ready when you are");
    expect(home).toContain("InstallPwaCard");
    expect(install).toContain("Come back to your next move in one tap.");
    expect(discover).toContain("Keep learning who you are by doing.");
    expect(discover).toContain("Small places to understand yourself better");
    expect(discover).toContain("Useful, bounded, no endless feed.");
  });

  it("keeps installation visible on public and authenticated mobile surfaces", () => {
    expect(publicShell).toContain("InstallPwaButton compact");
    expect(appShell).toContain("InstallPwaButton compact");
    expect(install).toContain("beforeinstallprompt");
    expect(install).toContain("iPad|iPhone|iPod");
    expect(install).toContain("Android");
    expect(install).toContain("Add to Home Screen");
    expect(install).toContain("Install app or Add to Home screen");
  });

  it("keeps the installed app resume-first and visually aligned", () => {
    expect(manifest).toContain('start_url: "/continue"');
    expect(manifest).toContain('background_color: "#f7f8fc"');
    expect(manifest).toContain('theme_color: "#ffffff"');
    expect(manifest).toContain('name: "Discover"');
    expect(manifest).toContain('name: "Profile"');
  });
});
