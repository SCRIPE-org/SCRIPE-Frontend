import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PluginCatalogView = dynamic(() =>
  import("@modules/plugins").then((m) => ({ default: m.PluginCatalogView }))
);

export const metadata: Metadata = {
  title: "Plugin Catalog",
  description: "Browse and install plugins from the SCRIPE marketplace",
};

export default function PluginCatalogPage() {
  return (
    <ModuleErrorBoundary moduleName="plugins.catalog">
      <PluginCatalogView />
    </ModuleErrorBoundary>
  );
}
