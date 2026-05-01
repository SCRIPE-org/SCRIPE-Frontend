import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const EmailComposerView = dynamic(() =>
  import("@modules/messaging/email-composer").then((m) => ({
    default: m.EmailComposerView,
  }))
);

export const metadata: Metadata = {
  title: "Email Composer | NEXORA",
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
