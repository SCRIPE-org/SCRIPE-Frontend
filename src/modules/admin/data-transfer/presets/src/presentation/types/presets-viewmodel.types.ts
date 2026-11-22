import type { DataExchangeEntitySummaryView } from "../../../../entities/src/domain/entities/DataExchangeEntity";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";
import type { PresetEntityFilterOption } from "../hooks/usePresetsEntityCatalog";

/**
 * Finite pagination metadata exposed by the presets ViewModel.
 */
export interface PresetsPaginationState {
  page: number;
  currentPage: number;
  pageNumber: number;
  pageSize: number;
  itemsCount: number;
  totalCount: number;
  pagesCount: number;
  totalPages: number;
}

/**
 * Return contract of the mapping presets ViewModel hook.
 */
export interface UsePresetsViewModelReturn {
  presets: DataExchangePreset[];
  allFilteredPresets: DataExchangePreset[];
  totalCount: number;
  pagesCount: number;
  totalPages: number;
  page: number;
  pageNumber: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageNumber: (page: number) => void;
  setPageSize: (size: number) => void;
  pagination: PresetsPaginationState;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isTenantRequired: boolean;
  search: string;
  entityFilter: string;
  entityFilterOptions: PresetEntityFilterOption[];
  setSearch: (search: string) => void;
  setEntityFilter: (entity: string) => void;
  refetch: () => Promise<unknown>;
  importableEntities: DataExchangeEntitySummaryView[];
  isCatalogLoading: boolean;
  getCatalogEntry: (entityKey: string) => DataExchangeEntitySummaryView | undefined;
  resolveEntityName: (entityKey: string) => string;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  activeStudioPreset: DataExchangePreset | null;
  setActiveStudioPreset: (preset: DataExchangePreset | null) => void;
  isCreatePickerOpen: boolean;
  setIsCreatePickerOpen: (open: boolean) => void;
  createStudioEntityKey: string | null;
  setCreateStudioEntityKey: (entityKey: string | null) => void;
  openCreateStudioPicker: () => void;
  launchCreateStudio: (entityKey: string) => void;
  isCreateStudioOpen: boolean;
  setIsCreateStudioOpen: (open: boolean) => void;
  setDefaultPreset: (preset: DataExchangePreset) => Promise<void>;
  isSettingDefault: boolean;
  presetToDelete: DataExchangePreset | null;
  isDeleteDialogOpen: boolean;
  isDeleting: boolean;
  promptDeletePreset: (preset: DataExchangePreset) => void;
  closeDeleteDialog: () => void;
  confirmDeletePreset: () => Promise<void>;
  kpis: {
    totalPresets: number;
    defaultPresets: number;
    entitiesCovered: number;
    totalMappings: number;
  };
}
