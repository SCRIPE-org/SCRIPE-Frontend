import type { Metadata } from "next";
import { Suspense } from "react";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ModulesLoadingSkeleton } from "@core/ui/layout/modules-loading-skeleton";
import { VenueSettingsView } from "@modules/venue/settings/src/presentation/views/VenueSettingsView";

export const metadata: Metadata = {
  title: "Settings | Venue",
  description:
    "Configure branch details, booking preferences, team collaboration, and advanced options.",
};

export default function VenueSettingsPage() {
  return (
    <ModuleErrorBoundary moduleName="venue.settings">
      <Suspense fallback={<ModulesLoadingSkeleton variant="table" />}>
        <VenueSettingsView />
      </Suspense>
    </ModuleErrorBoundary>
  );
}
