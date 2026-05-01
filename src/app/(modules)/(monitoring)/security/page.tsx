import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const SecurityDashboardView = dynamic(() =>
  import("@modules/monitoring/security").then((m) => ({ default: m.SecurityDashboardView }))
);

export const metadata: Metadata = {
  title: "Security Monitor | NEXORA",
  description: "Real-time security monitoring and threat detection",
};

export default function SecurityPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Security Monitor">
        <SecurityDashboardView />
      </ModuleErrorBoundary>
    </main>
  );
}
