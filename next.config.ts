import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence the "multiple lockfiles" warning in the SCRIPE monorepo
  turbopack: {
    root: __dirname,
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

  // Security: Hide X-Powered-By header
  poweredByHeader: false,
};
export default nextConfig;
