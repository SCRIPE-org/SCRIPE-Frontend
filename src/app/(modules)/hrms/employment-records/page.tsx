/**
* EmploymentRecord Page
*
* Server component that imports and renders the EmploymentRecord list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { EmploymentRecordListView } from
"@modules/hrms/employment-record/src/presentation/views/EmploymentRecordListView";

export const metadata: Metadata = {
title: "EmploymentRecords | SCRIPE",
description: "Manage employmentRecords",
};

export default function EmploymentRecordsPage() {
return (
<main>
      <ModuleErrorBoundary moduleName="Hrms">
            <EmploymentRecordListView />
      </ModuleErrorBoundary>
</main>
);
}