/**
 * WorkItems Page
 *
 * Server component that renders the WorkItem list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { WorkItemListView } from "@modules/work-management/work-item/src/presentation/views/WorkItemListView";

export const metadata: Metadata = {
  title: "Work Items | SCRIPE",
  description: "Manage tasks, follow-ups and assignments",
};

export default function WorkItemsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="WorkManagement">
        <WorkItemListView />
      </ModuleErrorBoundary>
    </main>
  );
}
