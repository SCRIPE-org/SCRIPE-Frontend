import type { Metadata } from "next";
import { TenantPlanEditWizardView } from "@modules/entitlements/tenant-plans";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

export const metadata: Metadata = {
  title: "Edit Tenant Plan",
  description: "Update plan details, pricing, features, and settings",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTenantPlanPage({ params }: Props) {
  const { id } = await params;

  return (
    <ModuleErrorBoundary moduleName="entitlements.tenantPlans.edit">
      <TenantPlanEditWizardView planId={id} />
    </ModuleErrorBoundary>
  );
}
