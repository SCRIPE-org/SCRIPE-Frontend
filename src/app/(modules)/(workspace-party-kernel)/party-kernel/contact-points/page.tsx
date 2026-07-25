/**
 * ContactPoint Page
 *
 * Server component that imports and renders the ContactPoint list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ContactPointListView } from "@modules/party-kernel/contact-point/src/presentation/views/ContactPointListView";

export const metadata: Metadata = {
  title: "Contact Points",
  description: "Manage Contact Points",
};

export default function ContactPointsPage() {
  return (
    <ModuleErrorBoundary moduleName="contactPoint.title">
      <ContactPointListView />
    </ModuleErrorBoundary>
  );
}
