import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const FinancialsView = dynamic(() =>
  import("@modules/marketplace").then((m) => ({ default: m.FinancialsView }))
);

export const metadata: Metadata = {
  title: "Financials | Marketplace | NEXORA",
  description: "Track app purchases and process developer payouts.",
};

export default function MarketplaceFinancialsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Marketplace">
        <FinancialsView />
      </ModuleErrorBoundary>
    </main>
  );
}
