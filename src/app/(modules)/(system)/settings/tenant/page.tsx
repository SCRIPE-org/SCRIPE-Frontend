import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantSettingsView = dynamic(
  () => import("@modules/system/tenant-settings").then((m) => ({ default: m.TenantSettingsView }))
);

export const metadata: Metadata = {
  title: "Tenant Settings | NEXORA",
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
