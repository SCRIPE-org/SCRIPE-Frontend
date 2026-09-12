import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AvailabilityView } from "@modules/venue/availability/src/presentation/views/AvailabilityView";

export const metadata: Metadata = {
  title: "Resource Availability",
  description: "Configure recurring resource availability and preview searchable capacity.",
};

export default function AvailabilityPage() {
  return (
    <ModuleErrorBoundary moduleName="availability.title">
      <AvailabilityView />
    </ModuleErrorBoundary>
  );
}
