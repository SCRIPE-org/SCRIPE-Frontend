import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const MessageTemplatesView = dynamic(
      () =>
            import("@modules/system/messaging/message-templates").then((m) => ({
                  default: m.MessageTemplatesView,
            }))
);

export const metadata: Metadata = {
      title: "Message Templates | NEXORA",
      description: "Manage email, SMS, and push notification templates",
};

export default function MessageTemplatesPage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Message Templates">
                        <MessageTemplatesView />
                  </ModuleErrorBoundary>
            </main>
      );
}
