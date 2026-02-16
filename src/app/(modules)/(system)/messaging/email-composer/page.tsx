import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { EmailComposerView } from "@modules/system/messaging/email-composer";

export const metadata: Metadata = {
      title: "Email Composer | Verified",
      description: "Compose and send emails to administrators and users",
};

export default function EmailComposerPage() {
      return (
            <main>
                  <ModuleErrorBoundary moduleName="Email Composer">
                        <EmailComposerView />
                  </ModuleErrorBoundary>
            </main>
      );
}
