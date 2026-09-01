import type { Metadata, Viewport } from "next";
import { ProductTelemetry } from "@/components/analytics/product-telemetry";

import "./globals.css";

const productionUrl = new URL("https://www.pipupath.name.ng");

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
    statusBarStyle: "default",
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
  colorScheme: "light",
  themeColor: "#ffffff",
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
        <ProductTelemetry />
        {children}
      </body>
    </html>
  );
}
