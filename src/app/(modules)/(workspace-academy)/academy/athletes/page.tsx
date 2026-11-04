import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AcademyAthletesView } from "@modules/academy/athletes/src/presentation/views/AcademyAthletesView";

export const metadata: Metadata = {
  title: "Academy Athletes & Families",
  description: "Governed child & adult athlete intake, sibling linking, and youth safeguarding.",
};

export default function AthletesPage() {
  return (
    <ModuleErrorBoundary moduleName="academy.athletes">
      <AcademyAthletesView />
    </ModuleErrorBoundary>
  );
}
