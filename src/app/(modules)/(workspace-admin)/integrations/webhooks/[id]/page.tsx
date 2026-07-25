import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const WebhookDetailView = dynamic(() =>
  import("@modules/integrations/webhooks").then((m) => ({ default: m.WebhookDetailView }))
);

export const metadata: Metadata = {
  title: "Webhook Details",
  description: "View webhook subscription details and delivery history",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WebhookDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <ModuleErrorBoundary moduleName="webhooks.detailTitle">
      <WebhookDetailView webhookId={id} />
    </ModuleErrorBoundary>
  );
}
