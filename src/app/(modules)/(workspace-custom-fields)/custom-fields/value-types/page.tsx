/**
 * Value Types Catalog Page -- Wave 5 row 5.4
 *
 * Server component that imports and renders the read-only Value Types
 * catalog view. See ValueTypeCatalogView.tsx for the page-shape reasoning.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { ValueTypeCatalogView } from "@modules/custom-fields/custom-field/src/presentation/views/ValueTypeCatalogView";

export const metadata: Metadata = {
  title: "Value Types",
  description: "Browse the value types available for custom fields",
};

export default function ValueTypesCatalogPage() {
  return (
    <ModuleErrorBoundary moduleName="customField.title">
      <ValueTypeCatalogView />
    </ModuleErrorBoundary>
  );
}
