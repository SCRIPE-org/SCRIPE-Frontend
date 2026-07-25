import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const SettingsView = dynamic(() =>
  import("@core/settings/presentation/views/SettingsView").then((m) => ({
    default: m.SettingsView,
  }))
);

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account and platform settings",
};

export default function SettingsPage() {
  return (
    <ModuleErrorBoundary moduleName="settings.pageTitle">
      <SettingsView />
    </ModuleErrorBoundary>
  );
}
