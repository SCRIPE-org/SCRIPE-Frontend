import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AcademyOverviewView } from "@modules/academy/academy-overview/src/presentation/views/AcademyOverviewView";

export const metadata: Metadata = {
  title: "Academy Command Center",
  description: "Operational overview, athlete enrollment, and training delivery for SCRIPE Academy.",
};

export default function AcademyPage() {
  return (
    <ModuleErrorBoundary moduleName="academy.title">
      <AcademyOverviewView />
    </ModuleErrorBoundary>
  );
}
