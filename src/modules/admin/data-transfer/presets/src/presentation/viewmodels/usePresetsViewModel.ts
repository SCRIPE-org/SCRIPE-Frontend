"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDataTransferContainer } from "../../../../di";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";

/**
 * Return signature of usePresetsViewModel hook.
 */
export interface UsePresetsViewModelReturn {
  presets: DataExchangePreset[];
  isLoading: boolean;
  isError: boolean;
  search: string;
  entityFilter: string;
  setSearch: (search: string) => void;
  setEntityFilter: (entity: string) => void;
  refetch: () => Promise<unknown>;
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
  const queryClient = useQueryClient();
  const repo = getDataTransferContainer().presetsRepository;

  const [search, setSearch] = useState<string>("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [presetToDelete, setPresetToDelete] = useState<DataExchangePreset | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const queryKey = useMemo(
    () => ["data-transfer", "presets", { entityKey: entityFilter }],
    [entityFilter]
  );

  const { data: rawPresets = [], isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      return repo.getPresets(entityFilter !== "all" ? entityFilter : undefined, signal);
    },
  });

  const filteredPresets = useMemo(() => {
    let result = rawPresets;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p: DataExchangePreset) =>
          p.name.toLowerCase().includes(q) ||
          p.entityKey.toLowerCase().includes(q) ||
          p.importMode.toLowerCase().includes(q)
      );
    }
    return result;
  }, [rawPresets, search]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return repo.deletePreset(id);
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setPresetToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ["data-transfer", "presets"] });
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

  const kpis = useMemo(() => {
    const total = rawPresets.length;
    let defaults = 0;
    const entitySet = new Set<string>();
    let totalMappings = 0;

    for (const p of rawPresets) {
      if (p.isDefault) defaults++;
      entitySet.add(p.entityKey);
      totalMappings += p.mappings.length;
    }

    return {
      totalPresets: total,
      defaultPresets: defaults,
      entitiesCovered: entitySet.size,
      totalMappings,
    };
  }, [rawPresets]);

  return {
    presets: filteredPresets,
    isLoading,
    isError,
    search,
    entityFilter,
    setSearch,
    setEntityFilter,
    refetch,
    presetToDelete,
    isDeleteDialogOpen,
    isDeleting: deleteMutation.isPending,
    promptDeletePreset,
    closeDeleteDialog,
    confirmDeletePreset,
    kpis,
  };
}
