import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ContactsView } from "@modules/crm/contacts";

export const metadata: Metadata = {
  title: "Commercial Contacts | SCRIPE CRM",
  description:
    "Enterprise sports operations CRM directory of commercial contacts, decision makers, and account stakeholders.",
};

export default function CrmContactsPage() {
  return (
    <ModuleErrorBoundary moduleName="crmContacts.title">
      <ContactsView />
    </ModuleErrorBoundary>
  );
}
