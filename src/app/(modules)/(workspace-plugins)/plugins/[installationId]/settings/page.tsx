import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PluginSettingsView = dynamic(() =>
  import("@modules/plugins").then((m) => ({ default: m.PluginSettingsView }))
);

export const metadata: Metadata = {
  title: "Plugin Settings",
  description: "Configure settings for an installed plugin",
};

interface PluginSettingsPageProps {
  params: Promise<{ installationId: string }>;
}

export default async function PluginSettingsPage({ params }: PluginSettingsPageProps) {
  const { installationId } = await params;
  return (
    <ModuleErrorBoundary moduleName="plugins.settings">
      <PluginSettingsView installationId={installationId} />
    </ModuleErrorBoundary>
  );
}
