/**
* MergeCandidate Page
*
* Server component that imports and renders the MergeCandidate list view.
*/
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { MergeCandidateListView } from
"@modules/party-kernel/merge-candidate/src/presentation/views/MergeCandidateListView";

export const metadata: Metadata = {
title: "MergeCandidates | SCRIPE",
description: "Manage mergeCandidates",
};

export default function MergeCandidatesPage() {
return (
<main>
      <ModuleErrorBoundary moduleName="PartyKernel">
            <MergeCandidateListView />
      </ModuleErrorBoundary>
</main>
);
}