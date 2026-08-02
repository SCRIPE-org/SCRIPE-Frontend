/**
 * Certification Page
 *
 * Server component that imports and renders the Certification list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { CertificationListView } from "@modules/hrms/certification/src/presentation/views/CertificationListView";

export const metadata: Metadata = {
  title: "Certifications",
  description: "Manage Certifications",
};

export default function CertificationsPage() {
  return (
    <ModuleErrorBoundary moduleName="certification.title">
      <CertificationListView />
    </ModuleErrorBoundary>
  );
}
