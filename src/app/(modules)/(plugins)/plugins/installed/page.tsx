import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const InstalledPluginsView = dynamic(() =>
  import("@modules/plugins").then((m) => ({ default: m.InstalledPluginsView }))
);

export const metadata: Metadata = {
  title: "Installed Plugins | NEXORA",
  description: "Manage your installed plugins",
};

export default function InstalledPluginsPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Installed Plugins">
        <InstalledPluginsView />
      </ModuleErrorBoundary>
    </main>
  );
}
