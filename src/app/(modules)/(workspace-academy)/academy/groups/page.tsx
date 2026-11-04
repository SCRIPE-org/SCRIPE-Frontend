import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AcademyGroupsView } from "@modules/academy/groups/src/presentation/views/AcademyGroupsView";

export const metadata: Metadata = {
  title: "Academy Training Groups & Rosters",
  description: "Operational squad cohort management, coach assignments, and governed group transfers.",
};

export default function GroupsPage() {
  return (
    <ModuleErrorBoundary moduleName="academy.groups">
      <AcademyGroupsView />
    </ModuleErrorBoundary>
  );
}
