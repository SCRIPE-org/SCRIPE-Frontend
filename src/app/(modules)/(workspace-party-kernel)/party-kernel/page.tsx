/**
 * Contacts Overview Page (/party-kernel)
 *
 * Server component that imports and renders the ContactsOverviewView workspace.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ContactsOverviewView } from "@modules/party-kernel/party/src/presentation/views/ContactsOverviewView";

export const metadata: Metadata = {
  title: "Contacts Overview",
  description: "Operational overview of people, organizations, and contact health",
};

export default function PartyKernelPage() {
  return (
    <ModuleErrorBoundary moduleName="party.overview.title">
      <ContactsOverviewView />
    </ModuleErrorBoundary>
  );
}
