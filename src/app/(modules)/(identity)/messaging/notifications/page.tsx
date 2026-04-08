import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const NotificationSenderView = dynamic(
      () =>
            import("@/modules/identity/messaging/notification-sender").then((m) => ({
                  default: m.NotificationSenderView,
            }))
);

export const metadata: Metadata = {
      title: "Notification Sender | NEXORA",
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
