import type { Metadata, Viewport } from "next";
import { ProductTelemetry } from "@/components/analytics/product-telemetry";

import "./globals.css";

const productionUrl = new URL("https://www.pipupath.name.ng");

const pwaInstallCaptureScript = `
(() => {
  if (window.__pipupathInstallCaptureReady) return;
  window.__pipupathInstallCaptureReady = true;

  const isAndroidAppShell = () =>
    document.referrer.startsWith("android-app://");

  const isStandalone = () => {
    const displayMode =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = window.navigator.standalone === true;
    return displayMode || iosStandalone || isAndroidAppShell();
  };

  const isMobile = () => {
    const ua = navigator.userAgent;
    const regularMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    const iPadDesktopMode =
      /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
    return regularMobile || iPadDesktopMode;
  };

  const publishInstallState = () => {
    window.dispatchEvent(new Event("pipupath:install-state"));
  };

  if (isStandalone()) {
    window.__pipupathAppInstalled = true;
    window.__pipupathDeferredInstallPrompt = null;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();

    // Mobile installation is handled by the Android app download. Never keep
    // a browser PWA prompt for mobile or for an already-installed app shell.
    if (isStandalone() || isMobile()) {
      window.__pipupathDeferredInstallPrompt = null;
      publishInstallState();
      return;
    }

    // Capture this before React hydration so desktop never loses the browser's
    // one-use native install event and falls back to manual instructions.
    window.__pipupathDeferredInstallPrompt = event;
    publishInstallState();
  });

  window.addEventListener("appinstalled", () => {
    window.__pipupathDeferredInstallPrompt = null;
    window.__pipupathAppInstalled = true;
    publishInstallState();
  });
})();
`;

export const metadata: Metadata = {
  title: {
    default: "PipuPath — The University for Human Potential",
    template: "%s | PipuPath",
  },
  description:
    "Discover who you are, develop what you carry and deploy it through real-world action.",
  applicationName: "PipuPath",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PipuPath",
    statusBarStyle: "black-translucent",
  },
  metadataBase: productionUrl,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#020817",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: pwaInstallCaptureScript }} />
        <ProductTelemetry />
        {children}
      </body>
    </html>
  );
}
