import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ContactDetailView } from "@modules/crm/contacts";

export const metadata: Metadata = {
  title: "Commercial Contact Context | SCRIPE CRM",
  description: "View and manage CRM Contact relationship context, primary account, and linked opportunities.",
};

interface CrmContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CrmContactDetailPage({ params }: CrmContactDetailPageProps) {
  const { id } = await params;

  return (
    <ModuleErrorBoundary moduleName="crmContacts.detail.title">
      <ContactDetailView contactId={id} />
    </ModuleErrorBoundary>
  );
}
