import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { CrmReportsView } from "@modules/crm/overview";

export const metadata: Metadata = {
  title: "CRM Commercial Reports & Analytics | SCRIPE",
  description:
    "Multi-currency isolated pipeline velocity, lead qualification funnel, and commercial execution analytics.",
};

export default function CrmReportsPage() {
  return (
    <ModuleErrorBoundary moduleName="crm.tabs.reports">
      <CrmReportsView />
    </ModuleErrorBoundary>
  );
}
