import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AcademyProgramsView } from "@modules/academy/programs/src/presentation/views/AcademyProgramsView";

export const metadata: Metadata = {
  title: "Academy Programs",
  description: "Configure multi-sport curriculum and developmental programs.",
};

export default function ProgramsPage() {
  return (
    <ModuleErrorBoundary moduleName="academy.programs">
      <AcademyProgramsView />
    </ModuleErrorBoundary>
  );
}
