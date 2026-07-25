/**
 * Party Page
 *
 * Server component that imports and renders the Party list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PartyListView } from "@modules/party-kernel/party/src/presentation/views/PartyListView";

export const metadata: Metadata = {
  title: "Parties",
  description: "Manage Parties",
};

export default function PartiesPage() {
  return (
    <ModuleErrorBoundary moduleName="party.title">
      <PartyListView />
    </ModuleErrorBoundary>
  );
}
