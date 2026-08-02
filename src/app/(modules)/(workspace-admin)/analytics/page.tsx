import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantAnalyticsView = dynamic(() =>
  import("@modules/monitoring/analytics").then((m) => ({ default: m.TenantAnalyticsView }))
);

export const metadata: Metadata = {
  title: "Tenant Analytics",
  description: "Performance metrics and comparison across tenants",
};

export default function AnalyticsPage() {
  return (
    <ModuleErrorBoundary moduleName="tenantAnalytics.title">
      <TenantAnalyticsView />
    </ModuleErrorBoundary>
  );
}
