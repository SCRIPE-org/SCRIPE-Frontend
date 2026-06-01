import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const CommissionDashboardView = dynamic(() =>
  import("@modules/entitlements/stripe-connect").then((m) => ({
    default: m.CommissionDashboardView,
  }))
);

export const metadata: Metadata = {
  title: "Commission Dashboard | SCRIPE",
  description: "Platform-wide commission revenue analytics and per-tenant breakdown",
};

export default function CommissionsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Commission Dashboard">
        <CommissionDashboardView />
      </ModuleErrorBoundary>
    </main>
  );
}
