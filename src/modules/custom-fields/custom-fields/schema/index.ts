/**
 * Schema Submodule Public Exports (Wave 6 row 6.5, both halves)
 */

// Components — export
export { SchemaExportButton } from "./src/presentation/components/SchemaExportButton";
export { SchemaExportDialog } from "./src/presentation/components/SchemaExportDialog";
export type { SchemaExportDialogProps } from "./src/presentation/components/SchemaExportDialog";

// Components — import
export { SchemaImportButton } from "./src/presentation/components/SchemaImportButton";
export { SchemaImportDialog } from "./src/presentation/components/SchemaImportDialog";
export type { SchemaImportDialogProps } from "./src/presentation/components/SchemaImportDialog";

// ViewModels / hooks — export
export {
  useSchemaExportViewModel,
  downloadSchemaBundle,
  ALL_ENTITY_TYPES_VALUE,
} from "./src/presentation/viewmodels/useSchemaExportViewModel";

// ViewModels / hooks — import
export { useSchemaImportViewModel } from "./src/presentation/viewmodels/useSchemaImportViewModel";

// Entities — export
export { SchemaBundle } from "./src/domain/entities/SchemaBundle";
export type {
  SchemaBundleData,
  SchemaGroupData,
  SchemaDefinitionData,
} from "./src/domain/entities/SchemaBundle";

// Entities — import
export { SchemaImportResult } from "./src/domain/entities/SchemaImportResult";
export type {
  SchemaImportGroupOutcome,
  SchemaImportGroupResultData,
} from "./src/domain/entities/SchemaImportResult";
export { SchemaImportError } from "./src/domain/entities/SchemaImportError";

// Interfaces — export
export type { ISchemaExportRepository } from "./src/domain/interfaces/ISchemaExportRepository";
export type { ISchemaExportService } from "./src/domain/interfaces/ISchemaExportService";

// Interfaces — import
export type { ISchemaImportRepository } from "./src/domain/interfaces/ISchemaImportRepository";
export type { ISchemaImportService } from "./src/domain/interfaces/ISchemaImportService";

// Wire contract constants — import
export {
  MAX_IMPORT_ITEMS,
  TOO_MANY_ROWS_ERROR_CODE,
  looksLikeSchemaBundlePayload,
} from "./src/data/models/SchemaImportModel";

// DI
export { getSchemaExportContainer, schemaExportContainer } from "./di";
export type { SchemaExportContainer } from "./di";
