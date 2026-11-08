import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AcademyReportsView } from "@modules/academy/analytics-reports/src/presentation/views/AcademyReportsView";

export const metadata: Metadata = {
  title: "Academy Dashboards & Reports",
  description: "Operational analytics, unique athlete metrics, training group fill rate, and governed exports.",
};

export default function ReportsPage() {
  return (
    <ModuleErrorBoundary moduleName="academy.reports">
      <AcademyReportsView />
    </ModuleErrorBoundary>
  );
}
