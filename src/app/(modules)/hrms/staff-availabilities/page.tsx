/**
* StaffAvailability Page
*
* Server component that imports and renders the StaffAvailability list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { StaffAvailabilityListView } from
"@modules/hrms/staff-availability/src/presentation/views/StaffAvailabilityListView";

export const metadata: Metadata = {
title: "StaffAvailabilities | SCRIPE",
description: "Manage staffAvailabilities",
};

export default function StaffAvailabilitiesPage() {
return (
<main>
      <ModuleErrorBoundary moduleName="Hrms">
            <StaffAvailabilityListView />
      </ModuleErrorBoundary>
</main>
);
}