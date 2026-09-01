import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const globals = read("src/app/globals.css");
const home = read("src/app/app/page.tsx");
const discover = read("src/app/discover/page.tsx");
const appShell = read("src/components/shells/app-shell.tsx");
const publicShell = read("src/components/shells/public-shell.tsx");
const authShell = read("src/components/shells/auth-shell.tsx");
const install = read("src/components/pwa/install-prompt.tsx");
const layout = read("src/app/layout.tsx");
const manifest = read("src/app/manifest.ts");
const button = read("src/components/ui/button.tsx");
const surface = read("src/components/ui/surface.tsx");
const stage26 = read("src/app/stage26.css");
const buildLayout = read("src/app/build/layout.tsx");
const guideLayout = read("src/app/guide/layout.tsx");
const build = read("src/app/build/page.tsx");

describe("Stage 25 blue restoration and mobile installation", () => {
  it("preserves the released blue identity beneath the Stage 26 mobile surface", () => {
    expect(globals).toContain("--background: #020817");
    expect(globals).toContain("color-scheme: dark");
    expect(globals).toContain("--panel: #07142f");
    expect(globals).toContain("--color-panel: var(--panel)");
    expect(globals).toContain(".bg-white {\n  background-color: #07142f;");
    expect(layout).toContain('colorScheme: "dark"');
    expect(layout).toContain('themeColor: "#020817"');
    expect(appShell).toContain("pp-app-experience");
    expect(appShell).toContain("pp-mobile-topbar");
    expect(appShell).toContain("pp-bottom-navigation");
  });

  it("keeps the Stage 23 Home and Discover interaction grammar", () => {
    expect(home).toContain('aria-label="Your growth path"');
    expect(home).toContain("Today&apos;s Next Step");
    expect(home).toContain("Your momentum");
    expect(discover).toContain("Your living insight");
    expect(discover).toContain(
      "Useful places based on your current adventure.",
    );
  });

  it("makes installation proactively discoverable across entry and app surfaces", () => {
    expect(publicShell).toContain("InstallPwaButton compact autoNudge");
    expect(authShell).toContain("InstallPwaButton compact autoNudge");
    expect(appShell).toContain("InstallPwaButton autoNudge");
    expect(install).toContain("beforeinstallprompt");
    expect(install).toContain("INSTALL_NUDGE_KEY");
    expect(install).toContain("NUDGE_COOLDOWN_MS");
    expect(install).toContain("iPad|iPhone|iPod");
    expect(install).toContain("Android");
    expect(install).toContain("Add to Home Screen");
    expect(install).toContain("Install app or Add to Home screen");
    expect(globals).toContain("@media (display-mode: standalone)");
  });

  it("keeps the installed app resume-first and blue-aligned", () => {
    expect(manifest).toContain('start_url: "/continue"');
    expect(manifest).toContain('background_color: "#020817"');
    expect(manifest).toContain('theme_color: "#07142f"');
    expect(manifest).toContain('name: "Discover"');
    expect(manifest).toContain('name: "Profile"');
  });

  it("lets the Stage 26 authenticated scope own colours across every Builder route", () => {
    expect(button).not.toContain("fallbackStyles");
    expect(button).not.toContain("backgroundColor");
    expect(surface).not.toContain("backgroundColor");
    expect(stage26).toContain("--panel: #ffffff");
    expect(stage26).toContain("-webkit-text-fill-color: #ffffff");
    expect(stage26).toContain(".pp-mobile-topbar .pp-install-entry");
    expect(stage26).toContain(".pp-responsive-action-row");
    expect(button).toContain('light: "pp-button-light"');
    expect(appShell).toContain("<BrandMark compact inverse");
    expect(appShell).toContain("<InstallPwaButton compact autoNudge");
    expect(home).not.toContain(
      'className="absolute right-5 bottom-5 left-5 z-10',
    );
    expect(build).not.toContain(
      'className="absolute right-5 bottom-5 left-5 z-10',
    );

    for (const layout of [buildLayout, guideLayout]) {
      expect(layout).toContain("AppShell");
      expect(layout).toContain("requireAuthenticatedIdentity");
    }
  });
});
