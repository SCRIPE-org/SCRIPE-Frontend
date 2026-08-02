import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const EmailComposerView = dynamic(() =>
  import("@modules/communication/message-composer").then((m) => ({
    default: m.EmailComposerView,
  }))
);

export const metadata: Metadata = {
  title: "Email Composer",
  description: "Compose and send emails to administrators and users",
};

export default function EmailComposerPage() {
  return (
    <ModuleErrorBoundary moduleName="messaging.email.title">
      <EmailComposerView />
    </ModuleErrorBoundary>
  );
}
