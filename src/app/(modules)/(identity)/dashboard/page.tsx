import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const DashboardView = dynamic(
  () => import("@/modules/identity/dashboard").then((m) => ({ default: m.DashboardView }))
);

export const metadata: Metadata = {
  title: "System Dashboard | NEXORA",
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
