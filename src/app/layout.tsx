import type { Metadata, Viewport } from "next";

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
  metadataBase: productionUrl,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/icon.svg",
    apple: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
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
