/**
* Qualification Page
*
* Server component that imports and renders the Qualification list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { QualificationListView } from
"@modules/hrms/qualification/src/presentation/views/QualificationListView";

export const metadata: Metadata = {
title: "Qualifications | SCRIPE",
description: "Manage qualifications",
};

export default function QualificationsPage() {
return (
<main>
      <ModuleErrorBoundary moduleName="Hrms">
            <QualificationListView />
      </ModuleErrorBoundary>
</main>
);
}