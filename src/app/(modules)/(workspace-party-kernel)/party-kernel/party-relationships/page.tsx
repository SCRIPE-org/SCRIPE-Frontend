/**
* PartyRelationship Page
*
* Server component that imports and renders the PartyRelationship list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PartyRelationshipListView } from
"@modules/party-kernel/party-relationship/src/presentation/views/PartyRelationshipListView";

export const metadata: Metadata = {
title: "PartyRelationships | SCRIPE",
description: "Manage partyRelationships",
};

export default function PartyRelationshipsPage() {
return (
<main>
      <ModuleErrorBoundary moduleName="PartyKernel">
            <PartyRelationshipListView />
      </ModuleErrorBoundary>
</main>
);
}