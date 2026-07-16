/**
* StaffCompetency Page
*
* Server component that imports and renders the StaffCompetency list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { StaffCompetencyListView } from
"@modules/hrms/staff-competency/src/presentation/views/StaffCompetencyListView";

export const metadata: Metadata = {
title: "StaffCompetencies | SCRIPE",
description: "Manage staffCompetencies",
};

export default function StaffCompetenciesPage() {
return (
<main>
      <ModuleErrorBoundary moduleName="Hrms">
            <StaffCompetencyListView />
      </ModuleErrorBoundary>
</main>
);
}