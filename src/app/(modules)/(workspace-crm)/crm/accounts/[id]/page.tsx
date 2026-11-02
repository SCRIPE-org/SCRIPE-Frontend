import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AccountDetailView } from "@modules/crm/accounts";

export const metadata: Metadata = {
  title: "Commercial Account 360 | SCRIPE CRM",
  description: "Comprehensive 360 overview of commercial account, active opportunities, and stakeholder contacts.",
};

interface CrmAccountDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CrmAccountDetailPage({ params }: CrmAccountDetailPageProps) {
  const { id } = await params;

  return (
    <ModuleErrorBoundary moduleName="crmAccounts.detail.title">
      <AccountDetailView accountId={id} />
    </ModuleErrorBoundary>
  );
}
