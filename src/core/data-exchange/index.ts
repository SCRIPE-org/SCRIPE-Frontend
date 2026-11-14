/** Public entry point for SCRIPE Data Exchange Studio (@core/data-exchange). */

export type * from "./domain/types";
export type { IDataExchangeService } from "./domain/interfaces/IDataExchangeService";
export type { IDataExchangeRepository } from "./domain/interfaces/IDataExchangeRepository";

export { DATA_EXCHANGE_ENDPOINTS } from "./data/services/data-exchange.endpoints";
export { DataExchangeService } from "./data/services/DataExchangeService";
export { DataExchangeRepository } from "./data/repositories/DataExchangeRepository";

export { DataExchangeToolbarActions } from "./presentation/components/DataExchangeToolbarActions";
export type { DataExchangeToolbarActionsProps } from "./presentation/components/DataExchangeToolbarActions";

export { DataExchangeStudioOverlay } from "./presentation/components/DataExchangeStudioOverlay";
export type { DataExchangeStudioOverlayProps } from "./presentation/components/DataExchangeStudioOverlay";

export { DataExchangeExportDialog } from "./presentation/components/DataExchangeExportDialog";
export type { DataExchangeExportDialogProps } from "./presentation/components/DataExchangeExportDialog";

export { ColumnNormalizationPopover } from "./presentation/components/ColumnNormalizationPopover";
export type { ColumnNormalizationPopoverProps } from "./presentation/components/ColumnNormalizationPopover";

export { previewNormalizedSample } from "./domain/mapping-validation";

export { useDataExchangeStudioViewModel } from "./presentation/viewmodels/useDataExchangeStudioViewModel";
export type {
  StudioStep,
  SheetMappingState,
  UseDataExchangeStudioOptions,
} from "./presentation/viewmodels/useDataExchangeStudioViewModel";

export { useDataExchangeJobsStore } from "./presentation/store/useDataExchangeJobsStore";
export type { DataExchangeJobsStoreState } from "./presentation/store/useDataExchangeJobsStore";

export { DataExchangeFloatingDock } from "./presentation/components/DataExchangeFloatingDock";
export {
  getEntityDisplayName,
  resolveEntityDisplayName,
  formatEntityLabel,
  formatDataExchangeEntityName,
} from "./presentation/utils/entity-display-names";
