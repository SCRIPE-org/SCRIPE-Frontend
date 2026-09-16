/**
 * Value Export Submodule Public Exports (Wave 6 row 6.4's completion)
 */

// Components
export { ValueExportButton } from "./src/presentation/components/ValueExportButton";
export { ValueExportDialog } from "./src/presentation/components/ValueExportDialog";
export type { ValueExportDialogProps } from "./src/presentation/components/ValueExportDialog";

// ViewModels / hooks
export {
  useValueExportViewModel,
  downloadValueExport,
  isEntityTypeViewableForValueExport,
} from "./src/presentation/viewmodels/useValueExportViewModel";

// Entities
export { ValueExport } from "./src/domain/entities/ValueExport";
export type { ValueExportData } from "./src/domain/entities/ValueExport";
export { ValueExportError } from "./src/domain/entities/ValueExportError";

// Interfaces
export type { IValueExportRepository } from "./src/domain/interfaces/IValueExportRepository";
export type { IValueExportService } from "./src/domain/interfaces/IValueExportService";

// Wire contract constants — the mirrored server limits, exported so a caller can name them without
// reaching into the data layer.
export {
  FORBIDDEN_ERROR_CODE,
  MAX_EXPORT_ROWS,
  ROW_CAP_ERROR_CODE,
  UNKNOWN_ENTITY_TYPE_ERROR_CODE,
  XLSX_CONTENT_TYPE,
} from "./src/data/models/ValueExportModel";

// DI
export { getValueExportContainer, valueExportContainer } from "./di";
export type { ValueExportContainer } from "./di";
