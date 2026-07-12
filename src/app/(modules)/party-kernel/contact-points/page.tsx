/**
* ContactPoint Page
*
* Server component that imports and renders the ContactPoint list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ContactPointListView } from
"@modules/party-kernel/contact-point/src/presentation/views/ContactPointListView";

export const metadata: Metadata = {
title: "ContactPoints | SCRIPE",
description: "Manage contactPoints",
};

export default function ContactPointsPage() {
return (
<main>
      <ModuleErrorBoundary moduleName="PartyKernel">
            <ContactPointListView />
      </ModuleErrorBoundary>
</main>
);
}