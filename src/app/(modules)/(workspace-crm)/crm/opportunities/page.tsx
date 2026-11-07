import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { OpportunitiesView } from "@modules/crm/opportunities";

export const metadata: Metadata = {
  title: "CRM Opportunities | SCRIPE",
  description:
    "Enterprise sports operations CRM opportunities, pipeline stages, and commercial deals.",
};

export default function CrmOpportunitiesPage() {
  return (
    <ModuleErrorBoundary moduleName="crmOpportunities.title">
      <OpportunitiesView />
    </ModuleErrorBoundary>
  );
}
