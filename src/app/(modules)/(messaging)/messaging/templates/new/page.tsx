import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TemplateFormView = dynamic(() =>
  import("@modules/messaging/message-templates/src/presentation/views/TemplateFormView").then(
    (m) => ({ default: m.TemplateFormView })
  )
);

export const metadata: Metadata = {
  title: "Create Template | NEXORA",
  description: "Create a new message template",
};

export default function NewTemplatePage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Template Form">
        <TemplateFormView />
      </ModuleErrorBoundary>
    </main>
  );
}
