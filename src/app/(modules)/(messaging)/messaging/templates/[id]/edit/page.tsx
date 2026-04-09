import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TemplateFormView = dynamic(
      () =>
            import(
                  "@modules/messaging/message-templates/src/presentation/views/TemplateFormView"
            ).then((m) => ({ default: m.TemplateFormView }))
);

export const metadata: Metadata = {
      title: "Edit Template | NEXORA",
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
