import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantPlansView = dynamic(() =>
  import("@modules/entitlements/tenant-plans").then((m) => ({ default: m.TenantPlansView }))
);

export const metadata: Metadata = {
  title: "Tenant Plans",
  description: "Create and manage pricing plans for your end-users",
};

export default function TenantPlansPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.tenantPlans.title">
      <TenantPlansView />
    </ModuleErrorBoundary>
  );
}
