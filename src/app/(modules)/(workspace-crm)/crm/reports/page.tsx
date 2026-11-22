import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { CrmReportsView } from "@modules/crm/reports";

export const metadata: Metadata = {
  title: "CRM Commercial Reports | SCRIPE",
  description:
    "Pipeline velocity, currency-isolated revenue breakdowns, lead funnel metrics, and executive CSV exports.",
};

/**
 * Next.js App Router entry point for CRM Pipeline & Funnel Reports.
 */
export default function CrmReportsPage() {
  return (
    <ModuleErrorBoundary moduleName="crm.reports.title">
      <CrmReportsView />
    </ModuleErrorBoundary>
  );
}
