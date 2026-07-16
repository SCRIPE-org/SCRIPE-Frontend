/**
* PartyPerson Page
*
* Server component that imports and renders the PartyPerson list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PartyPersonListView } from
"@modules/party-kernel/party-person/src/presentation/views/PartyPersonListView";

export const metadata: Metadata = {
title: "PartyPeople | SCRIPE",
description: "Manage partyPeople",
};

export default function PartyPeoplePage() {
return (
<main>
      <ModuleErrorBoundary moduleName="PartyKernel">
            <PartyPersonListView />
      </ModuleErrorBoundary>
</main>
);
}