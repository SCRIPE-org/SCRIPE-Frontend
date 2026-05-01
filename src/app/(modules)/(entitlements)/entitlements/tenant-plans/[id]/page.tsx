import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantPlanDetailView = dynamic(() =>
  import("@modules/entitlements/tenant-plans").then((m) => ({ default: m.TenantPlanDetailView }))
);

export const metadata: Metadata = {
  title: "Plan Details | NEXORA",
  description: "Manage plan features, pricing, versions, and promotions",
};

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function TenantPlanDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <main>
      <ModuleErrorBoundary moduleName="Tenant Plan Detail">
        <TenantPlanDetailView planId={id} />
      </ModuleErrorBoundary>
    </main>
  );
}
