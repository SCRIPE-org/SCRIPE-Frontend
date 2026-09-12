import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { FacilityResourceProfilesView } from "@modules/venue/facility-resource-profile/src/presentation/views/FacilityResourceProfilesView";

export const metadata: Metadata = {
  title: "Resource Profiles",
  description: "Define the operational profile of facility resources.",
};

export default function ResourceProfilesPage() {
  return (
    <ModuleErrorBoundary moduleName="resourceProfile.title">
      <FacilityResourceProfilesView />
    </ModuleErrorBoundary>
  );
}
