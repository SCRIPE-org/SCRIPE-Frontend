import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { TemplateFormView } from "@modules/system/messaging/message-templates/src/presentation/views/TemplateFormView";

export const metadata: Metadata = {
      title: "Edit Template | Verified",
      description: "Edit message template details",
};

export default function EditTemplatePage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Template Form">
                        <TemplateFormView />
                  </ModuleErrorBoundary>
            </main>
      );
}
