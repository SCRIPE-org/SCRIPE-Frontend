import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { NotificationSenderView } from "@modules/system/messaging/notification-sender";

export const metadata: Metadata = {
      title: "Notification Sender | Verified",
      description: "Send push notifications to admins, roles, or tenants",
};

export default function NotificationSenderPage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Notification Sender">
                        <NotificationSenderView />
                  </ModuleErrorBoundary>
            </main>
      );
}
