/**
 * WorkItems Page
 *
 * Server component that renders the WorkItem list view.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { WorkItemListView } from "@modules/work-management/work-item/src/presentation/views/WorkItemListView";

export const metadata: Metadata = {
  title: "Work Items",
  description: "Manage tasks, follow-ups and assignments",
};

export default function WorkItemsPage() {
  return (
    <ModuleErrorBoundary moduleName="workItem.title">
      <WorkItemListView />
    </ModuleErrorBoundary>
  );
}
