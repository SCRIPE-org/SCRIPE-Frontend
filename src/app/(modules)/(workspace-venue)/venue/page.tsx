import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { VenueOverviewView } from "@modules/venue/venue-overview/src/presentation/views/VenueOverviewView";

export const metadata: Metadata = {
  title: "Venue Command Center",
  description:
    "Operational overview, KPI health metrics, and fast navigation for venue management.",
};

export default function VenuePage() {
  return (
    <ModuleErrorBoundary moduleName="venue.title">
      <VenueOverviewView />
    </ModuleErrorBoundary>
  );
}
