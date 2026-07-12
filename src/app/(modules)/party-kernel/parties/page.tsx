/**
* Party Page
*
* Server component that imports and renders the Party list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PartyListView } from
"@modules/party-kernel/party/src/presentation/views/PartyListView";

export const metadata: Metadata = {
title: "Parties | SCRIPE",
description: "Manage parties",
};

export default function PartiesPage() {
return (
<main>
      <ModuleErrorBoundary moduleName="PartyKernel">
            <PartyListView />
      </ModuleErrorBoundary>
</main>
);
}