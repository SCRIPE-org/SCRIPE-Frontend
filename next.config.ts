import path from "path";
import type { NextConfig } from "next";

function extractOrigin(rawUrl: string | undefined): string | null {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

function buildSecurityHeaders() {
  const isDev = process.env.NODE_ENV !== "production";
  const httpOrigins = new Set<string>();
  const wsOrigins = new Set<string>();

  for (const candidate of [
    process.env.NEXT_PUBLIC_API_URL || (isDev ? "http://localhost:5035/api" : undefined),
    process.env.NEXT_PUBLIC_IDENTITY_API_URL,
  ]) {
    const origin = extractOrigin(candidate);
    if (origin) {
      httpOrigins.add(origin);
      wsOrigins.add(origin.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:"));
    }
  }

  if (isDev) {
    httpOrigins.add("http://localhost:*");
    httpOrigins.add("http://127.0.0.1:*");
    wsOrigins.add("ws://localhost:*");
    wsOrigins.add("wss://localhost:*");
    wsOrigins.add("ws://127.0.0.1:*");
  }

  const extraHttp = httpOrigins.size > 0 ? ` ${Array.from(httpOrigins).join(" ")}` : "";
  const extraWs = wsOrigins.size > 0 ? ` ${Array.from(wsOrigins).join(" ")}` : "";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    `img-src 'self' data: blob: https:${extraHttp}`,
    `connect-src 'self'${extraHttp}${extraWs}`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    `form-action 'self'${extraHttp}`,
  ].join("; ");

  return [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    {
      key: "Permissions-Policy",
      value:
        "camera=(self), microphone=(), geolocation=(), interest-cohort=(), publickey-credentials-get=(self), publickey-credentials-create=(self)",
    },
    { key: "Content-Security-Policy", value: csp },
  ];
}

const nextConfig: NextConfig = {
  // Silence the "multiple lockfiles" warning in the SCRIPE monorepo
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  experimental: {
    // Tree-shake heavy libraries — only bundle what's actually imported
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "date-fns",
      "zod",
      "react-day-picker",
      "chart.js",
      "react-chartjs-2",
    ],
  },

  // P2.5: Enable gzip compression for Next.js responses
  compress: true,

  // P2.5: Modern image format support (served when browser supports them)
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Security: Hide X-Powered-By header & enforce strict security headers
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: buildSecurityHeaders(),
      },
    ];
  },
};
export default nextConfig;
