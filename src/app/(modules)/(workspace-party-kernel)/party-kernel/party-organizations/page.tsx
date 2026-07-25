/**
 * PartyOrganization Page
 *
 * Server component that imports and renders the PartyOrganization list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PartyOrganizationListView } from "@modules/party-kernel/party-organization/src/presentation/views/PartyOrganizationListView";

export const metadata: Metadata = {
  title: "Party Organizations",
  description: "Manage Party Organizations",
};

export default function PartyOrganizationsPage() {
  return (
    <ModuleErrorBoundary moduleName="partyOrganization.title">
      <PartyOrganizationListView />
    </ModuleErrorBoundary>
  );
}
