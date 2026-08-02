import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const EditionWizardView = dynamic(() =>
  import("@modules/entitlements/editions").then((m) => ({ default: m.EditionWizardView }))
);

export const metadata: Metadata = {
  title: "Create Edition",
  description:
    "Create a new subscription edition with billing cycles, pricing, and feature configuration",
};

export default function CreateEditionPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.editions.create">
      <EditionWizardView />
    </ModuleErrorBoundary>
  );
}
