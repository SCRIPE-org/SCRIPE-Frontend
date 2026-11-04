import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AcademyTrialsView } from "@modules/academy/trials";

export const metadata: Metadata = {
  title: "Academy Trials & Evaluations",
  description: "Schedule skill tryouts, record coach evaluations, and make admission decisions.",
};

export default function TrialsPage() {
  return (
    <ModuleErrorBoundary moduleName="academy.trials">
      <AcademyTrialsView />
    </ModuleErrorBoundary>
  );
}
