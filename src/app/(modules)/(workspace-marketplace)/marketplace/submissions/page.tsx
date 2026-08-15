import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const SubmissionsView = dynamic(() =>
  import("@modules/marketplace").then((m) => ({ default: m.SubmissionsView }))
);

export const metadata: Metadata = {
  title: "Submissions | Marketplace",
  description: "Review and approve app submissions from developers.",
};

export default function MarketplaceSubmissionsPage() {
  return (
    <ModuleErrorBoundary moduleName="marketplace.submissionsTitle">
      <SubmissionsView />
    </ModuleErrorBoundary>
  );
}
