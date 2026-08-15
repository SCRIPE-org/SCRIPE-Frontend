import type { Metadata } from "next";
import { TenantPlanWizardView } from "@modules/entitlements/tenant-plans";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

export const metadata: Metadata = {
  title: "Create Tenant Plan",
};

export default function CreateTenantPlanPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.tenantPlans.create">
      <TenantPlanWizardView />
    </ModuleErrorBoundary>
  );
}
