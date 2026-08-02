import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const FeatureDefinitionFormView = dynamic(() =>
  import("@modules/entitlements/tenant-plans").then((m) => ({
    default: m.FeatureDefinitionFormView,
  }))
);

export const metadata: Metadata = {
  title: "Create Feature Definition",
  description: "Create a new feature definition for use in tenant edition plans",
};

export default function CreateFeatureDefinitionPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.featureDefinitions.create">
      <FeatureDefinitionFormView />
    </ModuleErrorBoundary>
  );
}
