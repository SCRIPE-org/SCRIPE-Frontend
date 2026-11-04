import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ExternalLocationsView } from "@modules/academy/locations";

export const metadata: Metadata = {
  title: "External Locations",
  description: "Manage unmanaged external facilities and venues for training delivery.",
};

export default function LocationsPage() {
  return (
    <ModuleErrorBoundary moduleName="academy.locations">
      <ExternalLocationsView />
    </ModuleErrorBoundary>
  );
}
