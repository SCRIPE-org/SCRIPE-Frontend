import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantFeatureDefinitionsView = dynamic(() =>
  import("@modules/entitlements/tenant-plans").then((m) => ({
    default: m.TenantFeatureDefinitionsView,
  }))
);

export const metadata: Metadata = {
  title: "Feature Definitions",
  description: "Manage the catalog of feature definitions available for tenant plans",
};

export default function TenantFeatureDefinitionsPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.featureDefinitions.title">
      <TenantFeatureDefinitionsView />
    </ModuleErrorBoundary>
  );
}
