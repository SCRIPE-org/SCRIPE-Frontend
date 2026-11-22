import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { LeadDetailView } from "@modules/crm/leads";

export const metadata: Metadata = {
  title: "Lead 360 Qualification Workspace | SCRIPE CRM",
  description: "Commercial lead qualification, party verification linkage, and deal conversion.",
};

interface CrmLeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CrmLeadDetailPage({ params }: CrmLeadDetailPageProps) {
  const { id } = await params;
  return (
    <ModuleErrorBoundary moduleName="crmLeads.title">
      <LeadDetailView leadId={decodeURIComponent(id)} />
    </ModuleErrorBoundary>
  );
}
