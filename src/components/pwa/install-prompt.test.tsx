import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InstallPwaButton, InstallPwaCard } from "./install-prompt";

type TestInstallWindow = Window & {
  __pipupathDeferredInstallPrompt?: {
    prompt: () => Promise<void>;
    userChoice: Promise<{
      outcome: "accepted" | "dismissed";
      platform: string;
    }>;
  } | null;
  __pipupathAppInstalled?: boolean;
};

type TestNavigator = Navigator & {
  getInstalledRelatedApps?: () => Promise<
    Array<{ id?: string; platform?: string }>
  >;
};

const originalUserAgent = navigator.userAgent;
const originalReferrer = document.referrer;
const originalGetInstalledRelatedApps = (
  navigator as TestNavigator
).getInstalledRelatedApps;

function setUserAgent(value: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value,
  });
}

function setReferrer(value: string) {
  Object.defineProperty(document, "referrer", {
    configurable: true,
    value,
  });
}

function setGetInstalledRelatedApps(
  value: TestNavigator["getInstalledRelatedApps"],
) {
  Object.defineProperty(window.navigator, "getInstalledRelatedApps", {
    configurable: true,
    value,
  });
}

function testInstallWindow() {
  return window as TestInstallWindow;
}

afterEach(() => {
  cleanup();
  setUserAgent(originalUserAgent);
  setReferrer(originalReferrer);
  setGetInstalledRelatedApps(originalGetInstalledRelatedApps);
  testInstallWindow().__pipupathDeferredInstallPrompt = null;
  testInstallWindow().__pipupathAppInstalled = false;
  window.localStorage.clear();
});

describe("PipuPath install experience", () => {
  it("does not replace a missing desktop native prompt with instructions", () => {
    render(<InstallPwaButton />);

    expect(
      screen.queryByRole("button", { name: "Install PipuPath" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("uses the real browser install prompt captured before hydration", async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    testInstallWindow().__pipupathDeferredInstallPrompt = {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
    };

    render(<InstallPwaButton />);

    const installButton = await screen.findByRole("button", {
      name: "Install PipuPath",
    });
    fireEvent.click(installButton);

    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Install PipuPath" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("keeps the Android download on the mobile website when the app is absent", async () => {
    setUserAgent(
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128.0 Mobile Safari/537.36",
    );
    setGetInstalledRelatedApps(vi.fn().mockResolvedValue([]));

    render(<InstallPwaButton />);

    expect(
      await screen.findByRole("button", { name: "Download PipuPath Lite" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Install PipuPath" }),
    ).not.toBeInTheDocument();
  });

  it("never shows download when the PipuPath Lite Android package is installed", async () => {
    setUserAgent(
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128.0 Mobile Safari/537.36",
    );
    const getInstalledRelatedApps = vi.fn().mockResolvedValue([
      {
        platform: "play",
        id: "ng.name.pipupath.lite",
      },
    ]);
    setGetInstalledRelatedApps(getInstalledRelatedApps);

    render(<InstallPwaButton />);

    await waitFor(() => expect(getInstalledRelatedApps).toHaveBeenCalledTimes(1));
    expect(
      screen.queryByRole("button", { name: "Download PipuPath Lite" }),
    ).not.toBeInTheDocument();
  });

  it("never shows download inside the installed Android app shell", () => {
    setUserAgent(
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128.0 Mobile Safari/537.36",
    );
    setReferrer("android-app://com.pipupath.app");

    render(<InstallPwaButton />);

    expect(
      screen.queryByRole("button", { name: "Download PipuPath Lite" }),
    ).not.toBeInTheDocument();
  });

  it("shows the desktop install card only when the browser is installable", async () => {
    testInstallWindow().__pipupathDeferredInstallPrompt = {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: "dismissed", platform: "web" }),
    };

    render(<InstallPwaCard />);

    expect(await screen.findByText("PipuPath for desktop")).toBeVisible();
    expect(
      screen.getByText("Install PipuPath on this computer."),
    ).toBeVisible();
  });
});
