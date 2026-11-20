import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PipelineManagementView } from "@modules/crm/workflows";

export const metadata: Metadata = {
  title: "CRM Pipeline & Stage Gates | SCRIPE",
  description:
    "Configure commercial pipeline stages, win probabilities, transition gates, and required fields.",
};

export default function CrmPipelinesPage() {
  return (
    <ModuleErrorBoundary moduleName="crmWorkflows.title">
      <PipelineManagementView />
    </ModuleErrorBoundary>
  );
}
