import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { WebhooksView } from "@modules/system/webhooks";

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
