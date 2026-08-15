import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const OverridesView = dynamic(() =>
  import("@modules/entitlements/overrides").then((m) => ({ default: m.OverridesView }))
);

export const metadata: Metadata = {
  title: "Feature Overrides",
  description: "Manage per-tenant feature value overrides",
};

interface Props {
  params: Promise<{ tenantId: string }>;
}

export default async function OverridesPage({ params }: Props) {
  const { tenantId } = await params;

  return (
    <ModuleErrorBoundary moduleName="entOverrides.overrides.title">
      <OverridesView tenantId={tenantId} />
    </ModuleErrorBoundary>
  );
}
