import path from "path";
import type { NextConfig } from "next";
import {
  buildCommonSecurityHeaders,
  buildStaticResourceCsp,
} from "./src/core/config/security-headers";

function buildNextHeaderRules() {
  const isDev = process.env.NODE_ENV !== "production";

  return [
    // Baseline security headers for all non-preview routes (CSP itself is issued per-request by src/proxy.ts)
    {
      source: "/((?!studio-preview|dashboard-preview).*)",
      headers: buildCommonSecurityHeaders({ isDev, frameAncestorsMode: "DENY" }),
    },
    // Allow Customization Studio to embed same-origin preview routes while keeping baseline hardening
    {
      source: "/studio-preview",
      headers: buildCommonSecurityHeaders({ isDev, frameAncestorsMode: "SAMEORIGIN" }),
    },
    {
      source: "/studio-preview/:path*",
      headers: buildCommonSecurityHeaders({ isDev, frameAncestorsMode: "SAMEORIGIN" }),
    },
    {
      source: "/dashboard-preview",
      headers: buildCommonSecurityHeaders({ isDev, frameAncestorsMode: "SAMEORIGIN" }),
    },
    {
      source: "/dashboard-preview/:path*",
      headers: buildCommonSecurityHeaders({ isDev, frameAncestorsMode: "SAMEORIGIN" }),
    },
    // Static /offline.html bypasses proxy.ts and receives strict script-src 'self' CSP
    {
      source: "/offline.html",
      headers: [
        { key: "Content-Security-Policy", value: buildStaticResourceCsp("offline") },
        { key: "Cache-Control", value: "no-cache" },
      ],
    },
    // First-party BFF / API routes bypass proxy.ts: lock down CSP and bind CORP same-origin
    {
      source: "/api/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: buildStaticResourceCsp("api") },
        { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
      ],
    },
    // Static public branding/font/JS assets stay readable across verified tenant custom domains
    {
      source: "/(fonts|brand)/:path*",
      headers: [{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" }],
    },
    {
      source: "/_next/static/:path*",
      headers: [{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" }],
    },
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

  // Security: Disable production browser source maps, hide X-Powered-By, & apply security headers
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  async headers() {
    return buildNextHeaderRules();
  },
};
export default nextConfig;
