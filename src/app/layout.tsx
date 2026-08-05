import type { Metadata, Viewport } from "next";

import { PIPUPATH_FAVICON_DATA_URI } from "@/components/brand/brand-assets";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PipuPath — The University for Human Potential",
    template: "%s | PipuPath",
  },
  description:
    "Discover who you are, develop what you carry and deploy it through real-world action.",
  applicationName: "PipuPath",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  icons: {
    icon: [{ url: PIPUPATH_FAVICON_DATA_URI, type: "image/png" }],
    shortcut: PIPUPATH_FAVICON_DATA_URI,
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
