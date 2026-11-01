import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { OpportunityDetailView } from "@modules/crm/opportunities";

export const metadata: Metadata = {
  title: "Opportunity Details | SCRIPE CRM",
  description: "View and manage CRM Opportunity lifecycle, stage history, and commercial closure.",
};

interface CrmOpportunityDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CrmOpportunityDetailPage({ params }: CrmOpportunityDetailPageProps) {
  const { id } = await params;

  return (
    <ModuleErrorBoundary moduleName="crmOpportunities.detail.dealDetails">
      <OpportunityDetailView opportunityId={id} />
    </ModuleErrorBoundary>
  );
}
