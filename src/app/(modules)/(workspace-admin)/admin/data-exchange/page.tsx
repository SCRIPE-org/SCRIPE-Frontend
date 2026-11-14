import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const EntitiesCatalogView = dynamic(() =>
  import("@modules/data-transfer").then((m) => ({ default: m.EntitiesCatalogView }))
);

export const metadata: Metadata = {
  title: "SCRIPE Data Exchange Entities Catalog",
  description:
    "Enterprise data exchange entity catalog, template generation, and quota management",
};

/**
 * Route handler for /admin/data-exchange rendering the Entities Catalog View.
 */
export default function DataExchangeEntitiesPage() {
  return (
    <ModuleErrorBoundary moduleName="dataTransferEntities.title">
      <EntitiesCatalogView />
    </ModuleErrorBoundary>
  );
}
