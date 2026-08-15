import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const EditionCategoriesView = dynamic(() =>
  import("@modules/entitlements/edition-categories").then((m) => ({
    default: m.EditionCategoriesView,
  }))
);

export const metadata: Metadata = {
  title: "Edition Categories",
  description: "Manage edition categories for plan grouping on pricing pages",
};

export default function EditionCategoriesPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.editions.categories.title">
      <EditionCategoriesView />
    </ModuleErrorBoundary>
  );
}
