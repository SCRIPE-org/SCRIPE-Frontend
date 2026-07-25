import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const AnalyticsView = dynamic(() =>
  import("@modules/entitlements/analytics").then((m) => ({
    default: m.AnalyticsView,
  }))
);

export const metadata: Metadata = {
  title: "Revenue Analytics",
  description: "Monitor MRR, retention, LTV, forecasts, and tenant health scores",
};

export default function AnalyticsPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.analytics.title">
      <AnalyticsView />
    </ModuleErrorBoundary>
  );
}
