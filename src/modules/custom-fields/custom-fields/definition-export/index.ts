/**
 * Definition Export Submodule Public Exports (Wave 6 row 6.4)
 */

// Components
export { DefinitionExportButton } from "./src/presentation/components/DefinitionExportButton";
export { DefinitionExportDialog } from "./src/presentation/components/DefinitionExportDialog";
export type { DefinitionExportDialogProps } from "./src/presentation/components/DefinitionExportDialog";

// ViewModels / hooks
export {
  useDefinitionExportViewModel,
  downloadDefinitionExport,
  ALL_ENTITY_TYPES_VALUE,
} from "./src/presentation/viewmodels/useDefinitionExportViewModel";

// Entities
export { DefinitionExport } from "./src/domain/entities/DefinitionExport";
export type { DefinitionExportData } from "./src/domain/entities/DefinitionExport";
export { DefinitionExportError } from "./src/domain/entities/DefinitionExportError";

// Interfaces
export type { IDefinitionExportRepository } from "./src/domain/interfaces/IDefinitionExportRepository";
export type { IDefinitionExportService } from "./src/domain/interfaces/IDefinitionExportService";

// Wire contract constants — the mirrored server limits, exported so a caller can name them without
// reaching into the data layer.
export {
  MAX_EXPORT_ROWS,
  ROW_CAP_ERROR_CODE,
  UNKNOWN_ENTITY_TYPE_ERROR_CODE,
  XLSX_CONTENT_TYPE,
} from "./src/data/models/DefinitionExportModel";

// DI
export { getDefinitionExportContainer, definitionExportContainer } from "./di";
export type { DefinitionExportContainer } from "./di";
