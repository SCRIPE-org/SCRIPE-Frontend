import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const FeatureDefinitionFormView = dynamic(() =>
  import("@modules/entitlements/tenant-plans").then((m) => ({
    default: m.FeatureDefinitionFormView,
  }))
);

export const metadata: Metadata = {
  title: "Feature Definition Details | NEXORA",
  description: "View feature definition configuration, limits, and value types",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FeatureDefinitionViewPage({ params }: Props) {
  const { id } = await params;

  return (
    <main>
      <ModuleErrorBoundary moduleName="Feature Definition Detail">
        <FeatureDefinitionFormView featureId={id} isViewMode={true} />
      </ModuleErrorBoundary>
    </main>
  );
}
