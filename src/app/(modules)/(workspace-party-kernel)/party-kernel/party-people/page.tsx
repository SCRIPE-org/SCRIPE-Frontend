/**
 * PartyPerson Page
 *
 * Server component that imports and renders the PartyPerson list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PartyPersonListView } from "@modules/party-kernel/party-person/src/presentation/views/PartyPersonListView";

export const metadata: Metadata = {
  title: "Party People",
  description: "Manage Party People",
};

export default function PartyPeoplePage() {
  return (
    <ModuleErrorBoundary moduleName="partyPerson.title">
      <PartyPersonListView />
    </ModuleErrorBoundary>
  );
}
