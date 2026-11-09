"use client";

import { useState, useCallback, useEffect } from "react";
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

  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<string>("athletes");

  const fetchMetrics = useCallback(async (filters?: AnalyticsFilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await repository.getOperationalMetrics({
        branchId: filters?.branchId !== undefined ? filters.branchId : branchFilter || undefined,
        programId: filters?.programId !== undefined ? filters.programId : programFilter || undefined,
        seasonId: filters?.seasonId !== undefined ? filters.seasonId : seasonFilter || undefined
      });
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load operational metrics.");
    } finally {
      setLoading(false);
    }
  }, [repository, branchFilter, programFilter, seasonFilter]);

  const handleDownloadExport = useCallback((dataset: string) => {
    const url = repository.getExportUrl(dataset, {
      branchId: branchFilter || undefined,
      programId: programFilter || undefined,
      seasonId: seasonFilter || undefined
    });
    window.open(url, "_blank");
    setIsExportDialogOpen(false);
  }, [repository, branchFilter, programFilter, seasonFilter]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

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
