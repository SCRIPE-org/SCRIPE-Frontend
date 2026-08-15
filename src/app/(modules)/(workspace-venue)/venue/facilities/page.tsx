import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { FacilityListView } from "@modules/venue/facility/src/presentation/views/FacilityListView";

export const metadata: Metadata = {
  title: "Facility Registry",
  description: "Register and manage the physical facilities inside your venues.",
};

export default function FacilitiesPage() {
  return (
    <ModuleErrorBoundary moduleName="facility.title">
      <FacilityListView />
    </ModuleErrorBoundary>
  );
}
