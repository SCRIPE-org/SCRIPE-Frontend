import type React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "@modules/docs/src/presentation/components/layout/DocsLayout";

export const metadata: Metadata = {
  title: "Commercial Documentation | SCRIPE Platform",
  description:
    "Enterprise features, pricing, security, and deployment options for the SCRIPE ERP Platform.",
  keywords: ["scripe", "commercial", "enterprise", "erp", "pricing", "security", "deployment"],
};

/**
 * Commercial Docs Layout — Uses the same shared DocsLayout
 * (ThemeProvider + DocsI18nProvider) as technical docs.
 */
export default function CommercialDocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsLayout scope="commercial">{children}</DocsLayout>;
}
