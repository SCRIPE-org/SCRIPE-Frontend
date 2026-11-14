"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@core/ui/sileo-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { getEntityDisplayName, isTenantRequiredError } from "@core/data-exchange";
import { getDataTransferContainer } from "../../../../di";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";

/**
 * Return signature of usePresetsViewModel hook.
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
  pagination: {
    page: number;
    pageNumber: number;
    pageSize: number;
    itemsCount: number;
    totalCount: number;
    pagesCount: number;
    totalPages: number;
  };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isTenantRequired: boolean;
  search: string;
  entityFilter: string;
  setSearch: (search: string) => void;
  setEntityFilter: (entity: string) => void;
  refetch: () => Promise<unknown>;
  // Studio interaction
  activeStudioPreset: DataExchangePreset | null;
  setActiveStudioPreset: (preset: DataExchangePreset | null) => void;
  isCreateStudioOpen: boolean;
  setIsCreateStudioOpen: (open: boolean) => void;
  // Default workflow
  setDefaultPreset: (preset: DataExchangePreset) => Promise<void>;
  isSettingDefault: boolean;
  // Delete workflow
  presetToDelete: DataExchangePreset | null;
  isDeleteDialogOpen: boolean;
  isDeleting: boolean;
  promptDeletePreset: (preset: DataExchangePreset) => void;
  closeDeleteDialog: () => void;
  confirmDeletePreset: () => Promise<void>;
  // KPIs
  kpis: {
    totalPresets: number;
    defaultPresets: number;
    entitiesCovered: number;
    totalMappings: number;
  };
}

/**
 * Presentation ViewModel hook managing saved column mapping presets.
 */
export function usePresetsViewModel(): UsePresetsViewModelReturn {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const tenantCode = useAppStore((s) => s.tenantCode);
  const queryClient = useQueryClient();
  const repo = getDataTransferContainer().presetsRepository;

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(10);
  const [search, setSearchState] = useState<string>("");
  const [entityFilter, setEntityFilterState] = useState<string>("all");
  const [presetToDelete, setPresetToDelete] = useState<DataExchangePreset | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [activeStudioPreset, setActiveStudioPreset] = useState<DataExchangePreset | null>(null);
  const [isCreateStudioOpen, setIsCreateStudioOpen] = useState<boolean>(false);

  const setSearch = useCallback((val: string) => {
    setSearchState(val);
    setPage(1);
  }, []);

  const setEntityFilter = useCallback((val: string) => {
    setEntityFilterState(val);
    setPage(1);
  }, []);

  const setPageSize = useCallback((nextSize: number) => {
    const valid = Number.isFinite(nextSize) && nextSize > 0 ? Math.floor(nextSize) : 10;
    setPageSizeState(valid);
    setPage(1);
  }, []);

  const queryKey = ["data-transfer", "presets", tenantCode ?? "platform", { entityKey: entityFilter }];

  const {
    data: rawPresets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      return repo.getPresets(entityFilter !== "all" ? entityFilter : undefined, signal);
    },
    retry: (failureCount, err) => !isTenantRequiredError(err) && failureCount < 2,
  });

  const isTenantRequired = isTenantRequiredError(error);

  const trimmedSearch = search.trim().toLowerCase();
  const filteredPresets = trimmedSearch
    ? rawPresets.filter(
        (p: DataExchangePreset) =>
          p.name.toLowerCase().includes(trimmedSearch) ||
          p.entityKey.toLowerCase().includes(trimmedSearch) ||
          p.importMode.toLowerCase().includes(trimmedSearch)
      )
    : rawPresets;

  const safePageSize = Math.max(1, Number.isFinite(pageSize) ? pageSize : 10);
  const totalCount = filteredPresets.length;
  const pagesCount = Math.max(1, Math.ceil(totalCount / safePageSize));
  const safePage = Math.min(Math.max(1, Number.isFinite(page) ? page : 1), pagesCount);

  const start = (safePage - 1) * safePageSize;
  const pagedPresets = filteredPresets.slice(start, start + safePageSize);

  const setDefaultMutation = useMutation({
    mutationFn: async (preset: DataExchangePreset) => {
      return repo.setDefaultPreset(preset.id);
    },
    onSuccess: (_data, preset) => {
      const localizedEntity = getEntityDisplayName(preset.entityKey, t, isAr);
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

  const setDefaultPreset = useCallback(
    async (preset: DataExchangePreset) => {
      await setDefaultMutation.mutateAsync(preset);
    },
    [setDefaultMutation]
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

  const promptDeletePreset = useCallback((preset: DataExchangePreset) => {
    setPresetToDelete(preset);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (!deleteMutation.isPending) {
      setIsDeleteDialogOpen(false);
      setPresetToDelete(null);
    }
  }, [deleteMutation.isPending]);

  const confirmDeletePreset = useCallback(async () => {
    if (!presetToDelete) return;
    await deleteMutation.mutateAsync(presetToDelete.id);
  }, [presetToDelete, deleteMutation]);

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
    setSearch,
    setEntityFilter,
    refetch,
    activeStudioPreset,
    setActiveStudioPreset,
    isCreateStudioOpen,
    setIsCreateStudioOpen,
    setDefaultPreset,
    isSettingDefault: setDefaultMutation.isPending,
    presetToDelete,
    isDeleteDialogOpen,
    isDeleting: deleteMutation.isPending,
    promptDeletePreset,
    closeDeleteDialog,
    confirmDeletePreset,
    kpis,
  };
}
