/**
 * StaffAssignment Page
 *
 * Server component that imports and renders the StaffAssignment list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { StaffAssignmentListView } from "@modules/hrms/staff-assignment/src/presentation/views/StaffAssignmentListView";

export const metadata: Metadata = {
  title: "Staff Assignments",
  description: "Manage Staff Assignments",
};

export default function StaffAssignmentsPage() {
  return (
    <ModuleErrorBoundary moduleName="staffAssignment.title">
      <StaffAssignmentListView />
    </ModuleErrorBoundary>
  );
}
