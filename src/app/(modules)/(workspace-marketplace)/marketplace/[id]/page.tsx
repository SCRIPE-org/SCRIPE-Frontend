import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

/**
 * Route: /marketplace/[id]
 *
 * App Detail page — loads AppDetailView which renders:
 *  - Screenshot carousel
 *  - Pricing card
 *  - Reviews tab with moderation
 *  - Admin actions (publish/unpublish/feature)
 *
 * Phase 5.1: App Detail Page UX polish.
 */
const AppDetailView = dynamic(() =>
  import("@modules/marketplace").then((m) => ({ default: m.AppDetailView }))
);

export const metadata: Metadata = {
  title: "App Detail | Marketplace | SCRIPE",
  description: "View details, screenshots, pricing, and reviews for a marketplace app listing.",
};

interface AppDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { id } = await params;
  return (
    <main>
      <ModuleErrorBoundary moduleName="Marketplace App Detail">
        <AppDetailView id={id} />
      </ModuleErrorBoundary>
    </main>
  );
}
