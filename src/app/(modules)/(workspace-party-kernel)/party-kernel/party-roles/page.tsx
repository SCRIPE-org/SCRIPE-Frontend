/**
* PartyRole Page
*
* Server component that imports and renders the PartyRole list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PartyRoleListView } from
"@modules/party-kernel/party-role/src/presentation/views/PartyRoleListView";

export const metadata: Metadata = {
title: "PartyRoles | SCRIPE",
description: "Manage partyRoles",
};

export default function PartyRolesPage() {
return (
<main>
      <ModuleErrorBoundary moduleName="PartyKernel">
            <PartyRoleListView />
      </ModuleErrorBoundary>
</main>
);
}