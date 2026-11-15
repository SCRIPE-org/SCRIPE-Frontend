"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@core/ui/sileo-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { isTenantRequiredError } from "@core/data-exchange/domain/tenant-errors";
import { getDataTransferContainer } from "../../../../di";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";
import {
  buildPresetEntityFilterOptions,
  usePresetsEntityCatalog,
} from "../hooks/usePresetsEntityCatalog";
import type {
  PresetsPaginationState,
  UsePresetsViewModelReturn,
} from "../types/presets-viewmodel.types";

/** Re-exported mapping presets ViewModel state and pagination types. */
export type { PresetsPaginationState, UsePresetsViewModelReturn };

/**
 * Presentation ViewModel hook managing saved column mapping presets.
 */
export function usePresetsViewModel(): UsePresetsViewModelReturn {
  const { t, language } = useI18n();
  const tenantCode = useAppStore((s) => s.tenantCode);
  const queryClient = useQueryClient();
  const repo = getDataTransferContainer().presetsRepository;
  const catalog = usePresetsEntityCatalog();

  const [page, setPageState] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(10);
  const [search, setSearchState] = useState<string>("");
  const [entityFilter, setEntityFilterState] = useState<string>("all");
  const [presetToDelete, setPresetToDelete] = useState<DataExchangePreset | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [activeStudioPreset, setActiveStudioPreset] = useState<DataExchangePreset | null>(null);
  const [isCreatePickerOpen, setIsCreatePickerOpen] = useState<boolean>(false);
  const [createStudioEntityKey, setCreateStudioEntityKey] = useState<string | null>(null);

  const setPage = useCallback((nextPage: number) => {
    const valid = Number.isFinite(nextPage) && nextPage >= 1 ? Math.floor(nextPage) : 1;
    setPageState(valid);
  }, []);

  const setSearch = useCallback((val: string) => {
    setSearchState(val);
    setPageState(1);
  }, []);

  const setEntityFilter = useCallback((val: string) => {
    setEntityFilterState(val);
    setPageState(1);
  }, []);

  const setPageSize = useCallback((nextSize: number) => {
    const valid = Number.isFinite(nextSize) && nextSize > 0 ? Math.floor(nextSize) : 10;
    setPageSizeState(valid);
    setPageState(1);
  }, []);

  const openCreateStudioPicker = useCallback(() => {
    setIsCreatePickerOpen(true);
  }, []);

  const launchCreateStudio = useCallback((entityKey: string) => {
    if (!entityKey) return;
    setIsCreatePickerOpen(false);
    setCreateStudioEntityKey(entityKey);
  }, []);

  const setIsCreateStudioOpen = useCallback((open: boolean) => {
    if (!open) {
      setCreateStudioEntityKey(null);
    } else {
      setIsCreatePickerOpen(true);
    }
  }, []);

  const queryKey = ["data-transfer", "presets", tenantCode ?? "platform"];

  const {
    data: rawPresets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      return repo.getPresets(undefined, signal);
    },
    retry: (failureCount, err) => !isTenantRequiredError(err) && failureCount < 2,
  });

  const isTenantRequired = isTenantRequiredError(error);

  const observedEntityKeys = rawPresets.map((p: DataExchangePreset) => p.entityKey);
  const entityFilterOptions = buildPresetEntityFilterOptions(
    catalog.catalogEntities,
    observedEntityKeys,
    catalog.resolveEntityName,
    language
  );

  const trimmedSearch = search.trim().toLowerCase();
  const normalizedEntityFilter = entityFilter.toLowerCase();
  const filteredPresets = rawPresets.filter((p: DataExchangePreset) => {
    if (
      normalizedEntityFilter !== "all" &&
      p.entityKey.toLowerCase() !== normalizedEntityFilter
    ) {
      return false;
    }
    if (!trimmedSearch) return true;
    const displayName = catalog.resolveEntityName(p.entityKey).toLowerCase();
    return (
      p.name.toLowerCase().includes(trimmedSearch) ||
      p.entityKey.toLowerCase().includes(trimmedSearch) ||
      displayName.includes(trimmedSearch) ||
      p.importMode.toLowerCase().includes(trimmedSearch)
    );
  });

  const safePageSize = Math.max(1, Number.isFinite(pageSize) ? Math.floor(pageSize) : 10);
  const totalCount = Number.isFinite(filteredPresets.length)
    ? Math.max(0, filteredPresets.length)
    : 0;
  const pagesCount = Math.max(1, Math.ceil(totalCount / safePageSize));
  const safePage = Math.min(Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1), pagesCount);

  const start = (safePage - 1) * safePageSize;
  const pagedPresets = filteredPresets.slice(start, start + safePageSize);

  const setDefaultMutation = useMutation({
    mutationFn: async (preset: DataExchangePreset) => {
      return repo.setDefaultPreset(preset.id);
    },
    onSuccess: (_data, preset) => {
      const localizedEntity = catalog.resolveEntityName(preset.entityKey);
      toast.success({
        id: `dx-preset-default-${preset.id}`,
        title: preset.name,
        description: t("adminDataTransferPresets.toast.setDefaultSuccess", {
          defaultValue: `${preset.name} is now the default mapping preset for ${localizedEntity}.`,
        }),
      });
      void queryClient.invalidateQueries({ queryKey: ["data-transfer", "presets"] });
    },
    onError: (_err, preset) => {
      toast.error({
        id: `dx-preset-default-${preset.id}`,
        title: preset.name,
        description: t("adminDataTransferPresets.toast.setDefaultError", {
          defaultValue: "Failed to set mapping preset as default.",
        }),
      });
    },
  });

  const { mutateAsync: setDefaultMutateAsync, isPending: isSettingDefault } = setDefaultMutation;

  const setDefaultPreset = useCallback(
    async (preset: DataExchangePreset) => {
      await setDefaultMutateAsync(preset);
    },
    [setDefaultMutateAsync]
  );

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return repo.deletePreset(id);
    },
    onSuccess: () => {
      toast.success({
        title: t("adminDataTransferPresets.deleteDialog.title"),
        description: t("adminDataTransferPresets.toast.deleteSuccess", {
          defaultValue: "Mapping preset deleted successfully.",
        }),
      });
      setIsDeleteDialogOpen(false);
      setPresetToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ["data-transfer", "presets"] });
    },
    onError: () => {
      toast.error({
        title: t("adminDataTransferPresets.deleteDialog.title"),
        description: t("adminDataTransferPresets.toast.deleteError", {
          defaultValue: "Failed to delete mapping preset.",
        }),
      });
    },
  });

  const { mutateAsync: deleteMutateAsync, isPending: isDeleting } = deleteMutation;

  const promptDeletePreset = useCallback((preset: DataExchangePreset) => {
    setPresetToDelete(preset);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteDialogOpen(false);
      setPresetToDelete(null);
    }
  }, [isDeleting]);

  const confirmDeletePreset = useCallback(async () => {
    if (!presetToDelete) return;
    await deleteMutateAsync(presetToDelete.id);
  }, [presetToDelete, deleteMutateAsync]);

  let defaults = 0;
  const entitySet = new Set<string>();
  let totalMappings = 0;

  for (const p of rawPresets) {
    if (p.isDefault) defaults++;
    entitySet.add(p.entityKey);
    totalMappings += p.mappings.length;
  }

  const kpis = {
    totalPresets: rawPresets.length,
    defaultPresets: defaults,
    entitiesCovered: entitySet.size,
    totalMappings,
  };

  return {
    presets: pagedPresets,
    allFilteredPresets: filteredPresets,
    totalCount,
    pagesCount,
    totalPages: pagesCount,
    page: safePage,
    pageNumber: safePage,
    pageSize: safePageSize,
    setPage,
    setPageNumber: setPage,
    setPageSize,
    pagination: {
      page: safePage,
      currentPage: safePage,
      pageNumber: safePage,
      pageSize: safePageSize,
      itemsCount: totalCount,
      totalCount,
      pagesCount,
      totalPages: pagesCount,
    },
    isLoading,
    isError,
    error,
    isTenantRequired,
    search,
    entityFilter,
    entityFilterOptions,
    setSearch,
    setEntityFilter,
    refetch,
    importableEntities: catalog.importableEntities,
    isCatalogLoading: catalog.isCatalogLoading,
    getCatalogEntry: catalog.getCatalogEntry,
    resolveEntityName: catalog.resolveEntityName,
    activeStudioPreset,
    setActiveStudioPreset,
    isCreatePickerOpen,
    setIsCreatePickerOpen,
    createStudioEntityKey,
    setCreateStudioEntityKey,
    openCreateStudioPicker,
    launchCreateStudio,
    isCreateStudioOpen: Boolean(createStudioEntityKey),
    setIsCreateStudioOpen,
    setDefaultPreset,
    isSettingDefault,
    presetToDelete,
    isDeleteDialogOpen,
    isDeleting,
    promptDeletePreset,
    closeDeleteDialog,
    confirmDeletePreset,
    kpis,
  };
}
