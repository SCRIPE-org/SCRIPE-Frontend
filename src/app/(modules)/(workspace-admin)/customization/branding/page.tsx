import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const TenantSettingsView = dynamic(() =>
  import("@modules/customization/tenant-settings").then((m) => ({ default: m.TenantSettingsView }))
);

export const metadata: Metadata = {
  title: "Branding Settings",
  description: "Configure tenant branding, logos, colors, and display settings",
};

export default function BrandingPage() {
  return (
    <ModuleErrorBoundary moduleName="tenantSettings.title">
      <TenantSettingsView />
    </ModuleErrorBoundary>
  );
}
