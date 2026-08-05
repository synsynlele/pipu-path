import type { NextConfig } from "next";

const enableVercelToolbar = process.env.VERCEL_ENV === "preview";
const toolbarScript = enableVercelToolbar ? " https://vercel.live" : "";
const toolbarStyle = enableVercelToolbar ? " https://vercel.live" : "";
const toolbarFont = enableVercelToolbar
  ? " https://vercel.live https://assets.vercel.com"
  : "";
const toolbarImage = enableVercelToolbar
  ? " https://vercel.live https://vercel.com"
  : "";
const toolbarConnect = enableVercelToolbar
  ? " https://vercel.live wss://ws-us3.pusher.com"
  : "";
const toolbarFrame = enableVercelToolbar ? "https://vercel.live" : "'none'";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${toolbarScript}`,
  `style-src 'self' 'unsafe-inline'${toolbarStyle}`,
  `font-src 'self' data:${toolbarFont}`,
  `img-src 'self' data: blob: https:${toolbarImage}`,
  "media-src 'self' blob:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com${toolbarConnect}`,
  `frame-src ${toolbarFrame}`,
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
