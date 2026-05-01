import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const FeaturesView = dynamic(() =>
  import("@modules/entitlements/features").then((m) => ({ default: m.FeaturesView }))
);

export const metadata: Metadata = {
  title: "Features | NEXORA",
  description: "Manage the feature catalog for edition-based feature gating",
};

export default function FeaturesPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Feature Management">
        <FeaturesView />
      </ModuleErrorBoundary>
    </main>
  );
}
