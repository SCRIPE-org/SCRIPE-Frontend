import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const DefinitionsView = dynamic(() =>
  import("@modules/plugins").then((m) => ({ default: m.DefinitionsView }))
);

export const metadata: Metadata = {
  title: "Plugin Definitions | Plugins",
  description:
    "Register and manage plugin definitions — the platform-level registry of all available plugins.",
};

export default function PluginDefinitionsPage() {
  return (
    <ModuleErrorBoundary moduleName="plugins.definitions">
      <DefinitionsView />
    </ModuleErrorBoundary>
  );
}
