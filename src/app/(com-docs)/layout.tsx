import type React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "@modules/docs/src/presentation/components/layout/DocsLayout";

export const metadata: Metadata = {
  title: "SCRIPE — B2B2C SaaS Platform for Growing Businesses",
  description:
    "Discover what SCRIPE offers: multi-tenant workspaces, subscription management, enterprise security, white-labeling, marketplace integrations, and everything your business needs to scale.",
  keywords: ["scripe", "b2b2c", "saas", "enterprise", "multi-tenant", "pricing", "security", "white-label", "marketplace"],
};

/**
 * Commercial Docs Layout — Uses the same shared DocsLayout
 * (ThemeProvider + DocsI18nProvider) as technical docs.
 */
export default function CommercialDocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsLayout scope="commercial">{children}</DocsLayout>;
}
