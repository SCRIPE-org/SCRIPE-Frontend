import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const CategoriesView = dynamic(() =>
  import("@modules/marketplace").then((m) => ({ default: m.CategoriesView }))
);

export const metadata: Metadata = {
  title: "Categories | Marketplace",
  description: "Manage app categories for the marketplace storefront.",
};

export default function MarketplaceCategoriesPage() {
  return (
    <ModuleErrorBoundary moduleName="marketplace.categoriesTitle">
      <CategoriesView />
    </ModuleErrorBoundary>
  );
}
