/**
 * CustomFields Page
 *
 * Server component that imports and renders the CustomField list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { CustomFieldListView } from "@modules/custom-fields/custom-field/src/presentation/views/CustomFieldListView";

export const metadata: Metadata = {
  title: "Custom Fields",
  description: "Manage custom field definitions",
};

export default function CustomFieldsPage() {
  return (
    <ModuleErrorBoundary moduleName="customField.title">
      <CustomFieldListView />
    </ModuleErrorBoundary>
  );
}
