import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PluginLogsView = dynamic(() =>
  import("@modules/plugins").then((m) => ({ default: m.PluginLogsView }))
);

export const metadata: Metadata = {
  title: "Plugin Execution Logs | SCRIPE",
  description: "View execution logs for an installed plugin",
};

interface PluginLogsPageProps {
  params: Promise<{ installationId: string }>;
}

export default async function PluginLogsPage({ params }: PluginLogsPageProps) {
  const { installationId } = await params;
  return (
    <main>
      <ModuleErrorBoundary moduleName="Plugin Logs">
        <PluginLogsView installationId={installationId} />
      </ModuleErrorBoundary>
    </main>
  );
}
