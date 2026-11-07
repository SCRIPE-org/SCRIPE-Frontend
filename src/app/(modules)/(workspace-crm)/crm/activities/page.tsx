import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ActivitiesExecutionDeskView } from "@modules/crm";

export const metadata: Metadata = {
  title: "Sales Activities & Execution Desk | SCRIPE CRM",
  description:
    "Daily commercial activities, meeting notes, call logs, and WorkManagement task dispatch.",
};

export default function CrmActivitiesPage() {
  return (
    <ModuleErrorBoundary moduleName="crmActivities.title">
      <ActivitiesExecutionDeskView />
    </ModuleErrorBoundary>
  );
}
