import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const DevelopersView = dynamic(() =>
  import("@modules/marketplace").then((m) => ({ default: m.DevelopersView }))
);

export const metadata: Metadata = {
  title: "Developers | Marketplace",
  description: "Manage developer profiles and verify trusted publishers.",
};

export default function MarketplaceDevelopersPage() {
  return (
    <ModuleErrorBoundary moduleName="marketplace.developersTitle">
      <DevelopersView />
    </ModuleErrorBoundary>
  );
}
