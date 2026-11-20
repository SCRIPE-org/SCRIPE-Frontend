/** Public entry point for SCRIPE Data Exchange Studio (@core/data-exchange). */

export type * from "./domain/types";
export { isTenantRequiredError } from "./domain/tenant-errors";
export type { IDataExchangeService } from "./domain/interfaces/IDataExchangeService";
export type { IDataExchangeRepository } from "./domain/interfaces/IDataExchangeRepository";

export { DATA_EXCHANGE_ENDPOINTS } from "./data/services/data-exchange.endpoints";
export { DataExchangeService } from "./data/services/DataExchangeService";
export { DataExchangeRepository } from "./data/repositories/DataExchangeRepository";

export { DataExchangeToolbarActions } from "./presentation/components/DataExchangeToolbarActions";
export type { DataExchangeToolbarActionsProps } from "./presentation/components/DataExchangeToolbarActions";
export { useDataExchangeToolbarViewModel } from "./presentation/viewmodels/useDataExchangeToolbarViewModel";
export type {
  UseDataExchangeToolbarOptions,
  UseDataExchangeToolbarReturn,
} from "./presentation/viewmodels/useDataExchangeToolbarViewModel";
export { DataExchangeTenantRequiredCard } from "./presentation/components/DataExchangeTenantRequiredCard";
export type { DataExchangeTenantRequiredCardProps } from "./presentation/components/DataExchangeTenantRequiredCard";

export { DataExchangeStudioOverlay } from "./presentation/components/DataExchangeStudioOverlay";
export type { DataExchangeStudioOverlayProps } from "./presentation/components/DataExchangeStudioOverlay";
export { DataExchangeStudioOverlay as DataExchangeStudioDialog } from "./presentation/components/DataExchangeStudioOverlay";
export type { DataExchangeStudioOverlayProps as DataExchangeStudioDialogProps } from "./presentation/components/DataExchangeStudioOverlay";

export { DataExchangeExportDialog } from "./presentation/components/DataExchangeExportDialog";
export type { DataExchangeExportDialogProps } from "./presentation/components/DataExchangeExportDialog";
export { useDataExchangeExportViewModel } from "./presentation/viewmodels/useDataExchangeExportViewModel";
export type {
  UseDataExchangeExportOptions,
  UseDataExchangeExportReturn,
} from "./presentation/viewmodels/useDataExchangeExportViewModel";

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
export { useDataExchangeFloatingDockViewModel } from "./presentation/viewmodels/useDataExchangeFloatingDockViewModel";
export type { UseDataExchangeFloatingDockReturn } from "./presentation/viewmodels/useDataExchangeFloatingDockViewModel";
export {
  getEntityDisplayName,
  resolveEntityDisplayName,
  formatEntityLabel,
  formatDataExchangeEntityName,
  registerEntityDisplayName,
  registerEntityDisplayNames,
  clearEntityDisplayNameCache,
} from "./presentation/utils/entity-display-names";
