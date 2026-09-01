import type { Metadata, Viewport } from "next";
import { ProductTelemetry } from "@/components/analytics/product-telemetry";

import "./globals.css";

const productionUrl = new URL("https://www.pipupath.name.ng");

const pwaInstallCaptureScript = `
(() => {
  if (window.__pipupathInstallCaptureReady) return;
  window.__pipupathInstallCaptureReady = true;

  const publishInstallState = () => {
    window.dispatchEvent(new Event("pipupath:install-state"));
  };

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
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
