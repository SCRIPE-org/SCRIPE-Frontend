import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

/**
 * Route: /plugins/[installationId]
 *
 * Plugin detail page — loads InstalledPluginDetailView which embeds
 * the plugin's own UI via the PluginFrame (postMessage SDK bridge).
 *
 * H-07: Wires PluginFrame SDK to the installed plugin detail page.
 */
const InstalledPluginDetailView = dynamic(() =>
  import("@modules/plugins").then((m) => ({ default: m.InstalledPluginDetailView }))
);

export const metadata: Metadata = {
  title: "Plugin Detail | SCRIPE",
  description: "View details and embedded UI for an installed plugin",
};

interface PluginDetailPageProps {
  params: Promise<{ installationId: string }>;
}

export default async function PluginDetailPage({ params }: PluginDetailPageProps) {
  const { installationId } = await params;
  return (
    <main>
      <ModuleErrorBoundary moduleName="Plugin Detail">
        <InstalledPluginDetailView installationId={installationId} />
      </ModuleErrorBoundary>
    </main>
  );
}
