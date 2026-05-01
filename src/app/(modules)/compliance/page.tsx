import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ComplianceDashboardView = dynamic(
  () =>
    import(
      "@modules/compliance/src/presentation/views/ComplianceDashboardView"
    ).then((mod) => ({ default: mod.ComplianceDashboardView }))
);

export const metadata: Metadata = {
  title: "Compliance Dashboard | NEXORA",
  description:
    "GDPR, CCPA & multi-regulation compliance management — data subject requests, consent tracking, and retention policies.",
};

export default function CompliancePage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Compliance">
        <ComplianceDashboardView />
      </ModuleErrorBoundary>
    </main>
  );
}