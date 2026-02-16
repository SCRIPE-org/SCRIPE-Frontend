import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { MessageTemplatesView } from "@modules/system/messaging/message-templates";

export const metadata: Metadata = {
      title: "Message Templates | Verified",
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
