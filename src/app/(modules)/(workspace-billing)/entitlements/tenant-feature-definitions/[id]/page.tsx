import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const FeatureDefinitionFormView = dynamic(() =>
  import("@modules/entitlements/tenant-plans").then((m) => ({
    default: m.FeatureDefinitionFormView,
  }))
);

export const metadata: Metadata = {
  title: "Feature Definition Details",
  description: "View feature definition configuration, limits, and value types",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FeatureDefinitionViewPage({ params }: Props) {
  const { id } = await params;

  return (
    <ModuleErrorBoundary moduleName="entitlements.featureDefinitions.view">
      <FeatureDefinitionFormView featureId={id} isViewMode={true} />
    </ModuleErrorBoundary>
  );
}
