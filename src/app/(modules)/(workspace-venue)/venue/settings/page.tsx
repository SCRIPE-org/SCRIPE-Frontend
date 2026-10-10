import type { Metadata } from "next";
import { Suspense } from "react";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { VenueSettingsView } from "@modules/venue/settings/src/presentation/views/VenueSettingsView";

export const metadata: Metadata = {
  title: "Settings | Venue",
  description: "Configure branch details, booking preferences, team collaboration, and advanced options.",
};

export default function VenueSettingsPage() {
  return (
    <ModuleErrorBoundary moduleName="venue.settings">
      <Suspense fallback={<LoadingSpinner showText={false} />}>
        <VenueSettingsView />
      </Suspense>
    </ModuleErrorBoundary>
  );
}
