import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { LeadsView } from "@modules/crm/leads";

export const metadata: Metadata = {
  title: "CRM Leads Intake | SCRIPE",
  description:
    "Enterprise sports operations CRM lead intake, qualification, and commercial partner portfolio.",
};

export default function CrmLeadsPage() {
  return (
    <ModuleErrorBoundary moduleName="crmLeads.title">
      <LeadsView />
    </ModuleErrorBoundary>
  );
}
