import type React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "@modules/docs/src/presentation/components/layout/DocsLayout";

export const metadata: Metadata = {
  title: "Technical Documentation | SCRIPE Platform",
  description:
    "Comprehensive technical documentation for the SCRIPE B2B2C SaaS Platform — Backend (.NET 10), Frontend (Next.js 16), CLI, and modular architecture guides.",
  keywords: ["scripe", "documentation", "b2b2c", "saas", "cqrs", ".net", "next.js", "modular monolith", "clean architecture"],
};

/**
 * Docs Layout — Completely isolated from the main app.
 * NO AppProvider, NO auth, NO RouteGuard, NO SignalR.
 * Only DocsI18nProvider + ThemeProvider for the docs portal.
 */
export default function DocsRootLayout({ children }: { children: React.ReactNode }) {
  return <DocsLayout>{children}</DocsLayout>;
}
