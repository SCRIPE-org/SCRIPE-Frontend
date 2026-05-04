import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const RegulationView = dynamic(() =>
  import("@modules/compliance/regulations").then((m) => ({ default: m.RegulationView }))
);

export const metadata: Metadata = {
  title: "Regulations & Frameworks | NEXORA",
  description: "Manage compliance regulations and control frameworks",
};

export default function RegulationsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Regulations & Frameworks">
        <RegulationView />
      </ModuleErrorBoundary>
    </main>
  );
}
