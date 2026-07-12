/**
* PartyOrganization Page
*
* Server component that imports and renders the PartyOrganization list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PartyOrganizationListView } from
"@modules/party-kernel/party-organization/src/presentation/views/PartyOrganizationListView";

export const metadata: Metadata = {
title: "PartyOrganizations | SCRIPE",
description: "Manage partyOrganizations",
};

export default function PartyOrganizationsPage() {
return (
<main>
      <ModuleErrorBoundary moduleName="PartyKernel">
            <PartyOrganizationListView />
      </ModuleErrorBoundary>
</main>
);
}