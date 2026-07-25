import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TemplateFormView = dynamic(() =>
  import("@modules/communication/templates").then((m) => ({ default: m.TemplateFormView }))
);

export const metadata: Metadata = {
  title: "Edit Template",
  description: "Edit message template details",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: Props) {
  const { id } = await params;

  return (
    <ModuleErrorBoundary moduleName="messaging.templates.editTitle">
      <TemplateFormView templateId={id} />
    </ModuleErrorBoundary>
  );
}
