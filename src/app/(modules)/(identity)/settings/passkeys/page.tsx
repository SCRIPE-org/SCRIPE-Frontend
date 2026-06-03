import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PasskeyManagementView = dynamic(() =>
  import("@modules/auth").then((m) => ({ default: m.PasskeyManagementView }))
);

export const metadata: Metadata = {
  title: "Passkeys | SCRIPE",
  description: "Manage your registered passkeys for passwordless sign-in",
};

export default function PasskeysPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Passkey Management">
        <PasskeyManagementView />
      </ModuleErrorBoundary>
    </main>
  );
}
