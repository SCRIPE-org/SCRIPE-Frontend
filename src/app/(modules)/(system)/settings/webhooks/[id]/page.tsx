import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { WebhookDetailView } from "@modules/system/webhooks";

export const metadata: Metadata = {
      title: "Webhook Details | Verified",
      description: "View webhook subscription details and delivery history",
};

interface Props {
      params: Promise<{ id: string }>;
}

export default async function WebhookDetailPage({ params }: Props) {
      const { id } = await params;

      return (
            <main>
                  <ModuleErrorBoundary moduleName="Webhook Detail">
                        <WebhookDetailView webhookId={id} />
                  </ModuleErrorBoundary>
            </main>
      );
}
