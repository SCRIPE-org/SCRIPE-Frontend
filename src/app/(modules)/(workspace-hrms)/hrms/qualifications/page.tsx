/**
 * Qualification Page
 *
 * Server component that imports and renders the Qualification list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { QualificationListView } from "@modules/hrms/qualification/src/presentation/views/QualificationListView";

export const metadata: Metadata = {
  title: "Qualifications",
  description: "Manage Qualifications",
};

export default function QualificationsPage() {
  return (
    <ModuleErrorBoundary moduleName="qualification.title">
      <QualificationListView />
    </ModuleErrorBoundary>
  );
}
