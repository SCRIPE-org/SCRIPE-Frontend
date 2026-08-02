/**
 * PartyRelationship Page
 *
 * Server component that imports and renders the PartyRelationship list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PartyRelationshipListView } from "@modules/party-kernel/party-relationship/src/presentation/views/PartyRelationshipListView";

export const metadata: Metadata = {
  title: "Party Relationships",
  description: "Manage Party Relationships",
};

export default function PartyRelationshipsPage() {
  return (
    <ModuleErrorBoundary moduleName="partyRelationship.title">
      <PartyRelationshipListView />
    </ModuleErrorBoundary>
  );
}
