import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const EditionEditWizardView = dynamic(() =>
  import("@modules/entitlements/editions").then((m) => ({ default: m.EditionEditWizardView }))
);

export const metadata: Metadata = {
  title: "Edit Edition",
  description:
    "Edit subscription edition settings — billing cycles, trial configuration, and core metadata",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEditionPage({ params }: Props) {
  const { id } = await params;
  return (
    <ModuleErrorBoundary moduleName="entitlements.editions.edit">
      <EditionEditWizardView editionId={id} />
    </ModuleErrorBoundary>
  );
}
