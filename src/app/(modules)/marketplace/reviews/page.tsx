import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ReviewsView = dynamic(() =>
  import("@modules/marketplace").then((m) => ({ default: m.ReviewsView }))
);

export const metadata: Metadata = {
  title: "Reviews | Marketplace | SCRIPE",
  description: "Moderate app reviews submitted by tenants.",
};

export default function MarketplaceReviewsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Marketplace">
        <ReviewsView />
      </ModuleErrorBoundary>
    </main>
  );
}
