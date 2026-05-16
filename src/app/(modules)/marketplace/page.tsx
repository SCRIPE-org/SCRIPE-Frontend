import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const MarketplaceListView = dynamic(() =>
  import("@modules/marketplace/src/presentation/views/MarketplaceListView").then(
    (m) => ({ default: m.MarketplaceListView })
  )
);

export const metadata: Metadata = {
  title: "Marketplace | NEXORA",
  description: "Browse and manage marketplace app listings, submissions, and developer profiles",
};

export default function MarketplacePage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Marketplace">
        <MarketplaceListView />
      </ModuleErrorBoundary>
    </main>
  );
}