import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const PluginCatalogView = dynamic(() =>
  import("@modules/plugins").then((m) => ({ default: m.PluginCatalogView }))
);

export const metadata: Metadata = {
  title: "Plugin Catalog | NEXORA",
  description: "Browse and install plugins from the NEXORA marketplace",
};

export default function PluginCatalogPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Plugin Catalog">
        <PluginCatalogView />
      </ModuleErrorBoundary>
    </main>
  );
}
