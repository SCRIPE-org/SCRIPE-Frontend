import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { TemplateFormView } from "@modules/system/messaging/message-templates/src/presentation/views/TemplateFormView";

export const metadata: Metadata = {
      title: "Edit Template | Verified",
      description: "Edit message template details",
};

interface Props {
      params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: Props) {
      const { id } = await params;

      return (
            <main>
                  <ModuleErrorBoundary moduleName="Template Form">
                        <TemplateFormView templateId={id} />
                  </ModuleErrorBoundary>
            </main>
      );
}
