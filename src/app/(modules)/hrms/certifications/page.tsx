/**
* Certification Page
*
* Server component that imports and renders the Certification list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { CertificationListView } from
"@modules/hrms/certification/src/presentation/views/CertificationListView";

export const metadata: Metadata = {
title: "Certifications | SCRIPE",
description: "Manage certifications",
};

export default function CertificationsPage() {
return (
<main>
      <ModuleErrorBoundary moduleName="Hrms">
            <CertificationListView />
      </ModuleErrorBoundary>
</main>
);
}