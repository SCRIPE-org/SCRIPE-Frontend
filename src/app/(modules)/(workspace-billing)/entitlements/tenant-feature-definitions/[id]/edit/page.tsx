import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const FeatureDefinitionFormView = dynamic(() =>
  import("@modules/entitlements/tenant-plans").then((m) => ({
    default: m.FeatureDefinitionFormView,
  }))
);

export const metadata: Metadata = {
  title: "Edit Feature Definition | SCRIPE",
  description: "Edit feature definition configuration, value types, and limits",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditFeatureDefinitionPage({ params }: Props) {
  const { id } = await params;

  return (
    <main>
      <ModuleErrorBoundary moduleName="Edit Feature Definition">
        <FeatureDefinitionFormView featureId={id} />
      </ModuleErrorBoundary>
    </main>
  );
}
