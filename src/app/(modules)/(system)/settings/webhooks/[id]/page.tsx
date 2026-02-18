import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const WebhookDetailView = dynamic(
      () => import("@modules/system/webhooks").then((m) => ({ default: m.WebhookDetailView }))
);

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
