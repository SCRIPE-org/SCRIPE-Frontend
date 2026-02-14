import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { TenantSettingsView } from "@modules/system/tenant-settings";

export const metadata: Metadata = {
  title: "Tenant Settings | Verified",
  description: "Configure your organization tenant settings and preferences",
};

export default function TenantSettingsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Tenant Settings">
        <TenantSettingsView />
      </ModuleErrorBoundary>
    </main>
  );
}
