import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const SecurityDashboardView = dynamic(() =>
  import("@modules/monitoring/security").then((m) => ({ default: m.SecurityDashboardView }))
);

export const metadata: Metadata = {
  title: "Security",
  description:
    "Monitor authentication posture, active access, and security activity across the SCRIPE platform.",
};

export default function SecurityPage() {
  return (
    <ModuleErrorBoundary moduleName="security.title">
      <SecurityDashboardView />
    </ModuleErrorBoundary>
  );
}
