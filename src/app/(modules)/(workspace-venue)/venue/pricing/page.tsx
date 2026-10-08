import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ResourcePricingView } from "@modules/venue/commercial/src/presentation/views/ResourcePricingView";

export const metadata: Metadata = {
  title: "Venue Resource Pricing",
  description: "Configure authoritative rental pricing for venue resources.",
};

export default function VenuePricingPage() {
  return (
    <ModuleErrorBoundary moduleName="pricing.title">
      <ResourcePricingView />
    </ModuleErrorBoundary>
  );
}
