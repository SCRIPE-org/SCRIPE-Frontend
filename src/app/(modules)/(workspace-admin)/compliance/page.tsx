import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ComplianceDashboardView = dynamic(() =>
  import("@modules/compliance/dashboard").then((m) => ({ default: m.ComplianceDashboardView }))
);

export const metadata: Metadata = {
  title: "Compliance",
  description: "Compliance dashboard — GDPR, CCPA, and data protection overview",
};

export default function CompliancePage() {
  return (
    <ModuleErrorBoundary moduleName="compliance.title">
      <ComplianceDashboardView />
    </ModuleErrorBoundary>
  );
}
