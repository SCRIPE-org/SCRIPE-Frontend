import type React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "@modules/docs/src/presentation/components/layout/DocsLayout";

export const metadata: Metadata = {
  title: "Documentation | SCRIPE Platform",
  description:
    "Comprehensive documentation for the Verified ERP Platform - Backend (.NET 10) & Frontend (Next.js)",
  keywords: ["verified", "documentation", "erp", "cqrs", ".net", "next.js", "modular monolith"],
};

/**
 * Docs Layout — Completely isolated from the main app.
 * NO AppProvider, NO auth, NO RouteGuard, NO SignalR.
 * Only DocsI18nProvider + ThemeProvider for the docs portal.
 */
export default function DocsRootLayout({ children }: { children: React.ReactNode }) {
  return <DocsLayout>{children}</DocsLayout>;
}
