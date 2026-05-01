import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ReportsView = dynamic(
  () => import("@modules/compliance/reports").then((m) => ({ default: m.ReportsView }))
);

export const metadata: Metadata = {
  title: "Compliance Reports | NEXORA",
  description: "Generate and download compliance reports — GDPR, CCPA, DSR summaries, consent audits, and retention analysis",
};

export default function ComplianceReportsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Compliance Reports">
        <ReportsView />
      </ModuleErrorBoundary>
    </main>
  );
}
