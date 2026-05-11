import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { PluginExecutionLogsView } from "@modules/plugins/installed/src/presentation/views/PluginExecutionLogsView";

export const metadata: Metadata = {
  title: "Execution Logs | Plugins | NEXORA",
  description: "Browse execution logs across all installed plugins",
};

export default function PluginsLogsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Plugin Execution Logs">
        <PluginExecutionLogsView />
      </ModuleErrorBoundary>
    </main>
  );
}
