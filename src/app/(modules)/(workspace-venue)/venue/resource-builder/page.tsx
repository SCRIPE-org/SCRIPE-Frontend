import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ResourceBuilderView } from "@modules/venue/schedulable-resource/src/presentation/views/ResourceBuilderView";

export const metadata: Metadata = {
  title: "Resource Builder",
  description: "Compose bookable resources, set capacity, and publish them for scheduling.",
};

export default function ResourceBuilderPage() {
  return (
    <ModuleErrorBoundary moduleName="schedulableResource.title">
      <ResourceBuilderView />
    </ModuleErrorBoundary>
  );
}
