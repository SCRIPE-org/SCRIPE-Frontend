/**
 * Entity Types Registry Page -- Wave 5 row 5.5
 *
 * Server component that renders the read-only Entity Types registry over the
 * existing GET /api/v1/custom-fields/entity-types endpoint. See
 * EntityTypeCatalogView.tsx for the page-shape reasoning.
 */
import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { EntityTypeCatalogView } from "@modules/custom-fields/custom-field";

export const metadata: Metadata = {
  title: "Entity Types",
  description: "Browse the entity types custom fields can be defined against",
};

export default function EntityTypesRegistryPage() {
  return (
    <ModuleErrorBoundary moduleName="customField.title">
      <EntityTypeCatalogView />
    </ModuleErrorBoundary>
  );
}
