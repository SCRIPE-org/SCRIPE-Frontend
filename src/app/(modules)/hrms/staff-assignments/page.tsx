/**
* StaffAssignment Page
*
* Server component that imports and renders the StaffAssignment list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { StaffAssignmentListView } from
"@modules/hrms/staff-assignment/src/presentation/views/StaffAssignmentListView";

export const metadata: Metadata = {
title: "StaffAssignments | SCRIPE",
description: "Manage staffAssignments",
};

export default function StaffAssignmentsPage() {
return (
<main>
      <ModuleErrorBoundary moduleName="Hrms">
            <StaffAssignmentListView />
      </ModuleErrorBoundary>
</main>
);
}