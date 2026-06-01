import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const BillingDashboardView = dynamic(() =>
  import("@modules/entitlements/billing").then((m) => ({ default: m.BillingDashboardView }))
);

export const metadata: Metadata = {
  title: "Revenue Dashboard | SCRIPE",
  description: "Real-time billing analytics, MRR, ARR, churn rate, and revenue trends",
};

export default function BillingDashboardPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Billing Dashboard">
        <BillingDashboardView />
      </ModuleErrorBoundary>
    </main>
  );
}
