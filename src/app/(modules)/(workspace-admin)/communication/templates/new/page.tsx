import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TemplateFormView = dynamic(() =>
  import("@modules/communication/templates").then((m) => ({ default: m.TemplateFormView }))
);

export const metadata: Metadata = {
  title: "Create Template",
  description: "Create a new message template",
};

export default function NewTemplatePage() {
  return (
    <ModuleErrorBoundary moduleName="messaging.templates.createTitle">
      <TemplateFormView />
    </ModuleErrorBoundary>
  );
}
