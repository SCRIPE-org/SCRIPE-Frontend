"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { IAcademyAnalyticsRepository } from "../../domain/interfaces/IAcademyAnalyticsRepository";
import type {
  AcademyOperationalMetrics,
  AnalyticsFilterParams
} from "../../domain/entities/AcademyAnalytics";

export function useAcademyReportsViewModel(repository: IAcademyAnalyticsRepository) {
  const [metrics, setMetrics] = useState<AcademyOperationalMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [branchFilter, setBranchFilter] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");
  const [seasonFilter, setSeasonFilter] = useState<string>("");
  const [appliedFilters, setAppliedFilters] = useState<AnalyticsFilterParams>({});
  const requestSequence = useRef(0);

  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<string>("athletes");

  const loadMetrics = useCallback(async (filters: AnalyticsFilterParams) => {
    const requestId = ++requestSequence.current;
    const normalizedFilters: AnalyticsFilterParams = {
      branchId: filters.branchId || undefined,
      programId: filters.programId || undefined,
      seasonId: filters.seasonId || undefined,
    };
    setLoading(true);
    setError(null);
    try {
      const data = await repository.getOperationalMetrics(normalizedFilters);
      if (requestId !== requestSequence.current) return;
      setMetrics(data);
      setAppliedFilters(normalizedFilters);
    } catch (err) {
      if (requestId !== requestSequence.current) return;
      setError(err instanceof Error ? err.message : "Failed to load operational metrics.");
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  }, [repository]);

  const fetchMetrics = useCallback(async (filters?: AnalyticsFilterParams) => {
    await loadMetrics(filters ?? {
      branchId: branchFilter,
      programId: programFilter,
      seasonId: seasonFilter,
    });
  }, [loadMetrics, branchFilter, programFilter, seasonFilter]);

  const handleDownloadExport = useCallback((dataset: string) => {
    const url = repository.getExportUrl(dataset, {
      branchId: appliedFilters.branchId,
      programId: appliedFilters.programId,
      seasonId: appliedFilters.seasonId,
    });
    window.open(url, "_blank");
    setIsExportDialogOpen(false);
  }, [repository, appliedFilters]);

  useEffect(() => {
    void loadMetrics({});
    return () => {
      requestSequence.current += 1;
    };
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    error,
    branchFilter,
    programFilter,
    seasonFilter,
    isExportDialogOpen,
    selectedDataset,
    setBranchFilter,
    setProgramFilter,
    setSeasonFilter,
    setIsExportDialogOpen,
    setSelectedDataset,
    fetchMetrics,
    handleDownloadExport
  };
}
