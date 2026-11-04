import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { AcademySeasonsView } from "@modules/academy/seasons";

export const metadata: Metadata = {
  title: "Academy Seasons",
  description: "Manage academy terms and delivery seasons.",
};

export default function SeasonsPage() {
  return (
    <ModuleErrorBoundary moduleName="academy.seasons">
      <AcademySeasonsView />
    </ModuleErrorBoundary>
  );
}
