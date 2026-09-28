import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { SiteListView } from "@modules/venue/site/src/presentation/views/SiteListView";

export const metadata: Metadata = {
  title: "Sites & Campuses",
  description: "Manage physical locations, sports campuses, and grounds.",
};

export default function SitesPage() {
  return (
    <ModuleErrorBoundary moduleName="site.title">
      <SiteListView />
    </ModuleErrorBoundary>
  );
}
