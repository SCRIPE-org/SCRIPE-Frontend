/**
 * StaffAvailability Page
 *
 * Server component that imports and renders the StaffAvailability list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { StaffAvailabilityListView } from "@modules/hrms/staff-availability/src/presentation/views/StaffAvailabilityListView";

export const metadata: Metadata = {
  title: "Staff Availabilities",
  description: "Manage Staff Availabilities",
};

export default function StaffAvailabilitiesPage() {
  return (
    <ModuleErrorBoundary moduleName="staffAvailability.title">
      <StaffAvailabilityListView />
    </ModuleErrorBoundary>
  );
}
