import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const SecurityDashboardView = dynamic(
  () => import("@modules/system/security").then((m) => ({ default: m.SecurityDashboardView }))
);

export const metadata: Metadata = {
  title: "Security Dashboard | Verified",
  description: "Monitor security threats, failed logins, and blocked IPs",
};

export default function SecurityPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Security Dashboard">
        <SecurityDashboardView />
      </ModuleErrorBoundary>
    </main>
  );
}
