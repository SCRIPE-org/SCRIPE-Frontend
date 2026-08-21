/**
 * Schema Export Submodule Public Exports (Wave 6 row 6.5)
 */

// Components
export { SchemaExportButton } from "./src/presentation/components/SchemaExportButton";
export { SchemaExportDialog } from "./src/presentation/components/SchemaExportDialog";
export type { SchemaExportDialogProps } from "./src/presentation/components/SchemaExportDialog";

// ViewModels / hooks
export {
  useSchemaExportViewModel,
  downloadSchemaBundle,
  ALL_ENTITY_TYPES_VALUE,
} from "./src/presentation/viewmodels/useSchemaExportViewModel";

// Entities
export { SchemaBundle } from "./src/domain/entities/SchemaBundle";
export type {
  SchemaBundleData,
  SchemaGroupData,
  SchemaDefinitionData,
} from "./src/domain/entities/SchemaBundle";

// Interfaces
export type { ISchemaExportRepository } from "./src/domain/interfaces/ISchemaExportRepository";
export type { ISchemaExportService } from "./src/domain/interfaces/ISchemaExportService";

// DI
export { getSchemaExportContainer, schemaExportContainer } from "./di";
export type { SchemaExportContainer } from "./di";
