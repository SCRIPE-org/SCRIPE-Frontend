import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { TemplateFormView } from "@modules/system/messaging/message-templates/src/presentation/views/TemplateFormView";

export const metadata: Metadata = {
      title: "Create Template | Verified",
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
