/**
 * Field Groups Page -- Wave 5 row 5.2
 *
 * Server component that renders the Field Groups admin screen. A plain route,
 * not a dialog opened from the definitions list -- see FieldGroupListView.tsx
 * for the container reasoning.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { FieldGroupListView } from "@modules/custom-fields/field-group/src/presentation/views/FieldGroupListView";

export const metadata: Metadata = {
  title: "Field Groups",
  description: "Manage custom field groups and their display order",
};

export default function FieldGroupsPage() {
  return (
    <ModuleErrorBoundary moduleName="fieldGroup.title">
      <FieldGroupListView />
    </ModuleErrorBoundary>
  );
}
