import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantPlanComparisonView = dynamic(
  () =>
    import(
      "@modules/entitlements/tenant-plans/src/presentation/views/TenantPlanComparisonView"
    ).then((m) => ({
      default: m.TenantPlanComparisonView,
    }))
);

export const metadata: Metadata = {
  title: "Compare Tenant Plans | NEXORA",
  description: "Side-by-side comparison of tenant plans and their feature sets",
};

export default function TenantPlanComparePage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Tenant Plan Comparison">
        <TenantPlanComparisonView />
      </ModuleErrorBoundary>
    </main>
  );
}
