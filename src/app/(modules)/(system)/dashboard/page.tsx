import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { DashboardView } from "@modules/system/dashboard";

export const metadata: Metadata = {
  title: "System Dashboard | Verified",
  description: "System dashboard with KPIs, activity charts, and security monitoring",
};

export default function DashboardPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Dashboard">
        <DashboardView />
      </ModuleErrorBoundary>
    </main>
  );
}
