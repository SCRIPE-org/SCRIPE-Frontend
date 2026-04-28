import { TenantPlanComparisonView } from "@modules/entitlements/tenant-plans/src/presentation/views/TenantPlanComparisonView";
import { PermissionGate } from "@core/components/permission-gate";

export default function TenantPlanComparePage() {
  return (
    <PermissionGate permission="tenant_plans.view">
      <div className="container mx-auto py-6 max-w-7xl">
        <TenantPlanComparisonView />
      </div>
    </PermissionGate>
  );
}
