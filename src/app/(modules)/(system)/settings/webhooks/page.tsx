import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const WebhooksView = dynamic(
      () => import("@modules/system/webhooks").then((m) => ({ default: m.WebhooksView }))
);

export const metadata: Metadata = {
      title: "Webhooks | Verified",
      description: "Manage webhook subscriptions and delivery monitoring",
};

export default function WebhooksPage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Webhooks">
                        <WebhooksView />
                  </ModuleErrorBoundary>
            </main>
      );
}
