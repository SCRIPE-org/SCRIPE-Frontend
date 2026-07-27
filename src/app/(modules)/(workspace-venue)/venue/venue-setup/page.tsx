import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { VenueProfileListView } from "@modules/venue/venue-profile/src/presentation/views/VenueProfileListView";

export const metadata: Metadata = {
  title: "Venue & Site Setup",
  description: "Configure venue profiles for your organization's sites.",
};

export default function VenueSetupPage() {
  return (
    <ModuleErrorBoundary moduleName="venueProfile.title">
      <VenueProfileListView />
    </ModuleErrorBoundary>
  );
}
