/**
 * StaffCompetency Page
 *
 * Server component that imports and renders the StaffCompetency list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { StaffCompetencyListView } from "@modules/hrms/staff-competency/src/presentation/views/StaffCompetencyListView";

export const metadata: Metadata = {
  title: "Staff Competencies",
  description: "Manage Staff Competencies",
};

export default function StaffCompetenciesPage() {
  return (
    <ModuleErrorBoundary moduleName="staffCompetency.title">
      <StaffCompetencyListView />
    </ModuleErrorBoundary>
  );
}
