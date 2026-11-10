import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AcademySportsSetupView } from "@modules/academy/setup/sports/src/presentation/views/AcademySportsSetupView";

export const metadata: Metadata = {
  title: "Academy Sports Setup — SCRIPE",
  description: "Activate and manage canonical sports and disciplines for your academy.",
};

export default function AcademySportsSetupPage() {
  return (
    <ModuleErrorBoundary moduleName="academy.setup.sports">
      <AcademySportsSetupView />
    </ModuleErrorBoundary>
  );
}
