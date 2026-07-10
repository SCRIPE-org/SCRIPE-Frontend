"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { integrationsContainer } from "@modules/integrations/di";
import type { UpdateApiKeyDetailRequest } from "../../domain/entities/ApiKeyDetail";
import type { ChartParams, ActivityParams } from "../../domain/interfaces/IApiKeyDetailService";
import type { CreateApiKeyResult } from "../../domain/entities/ApiKey";

export function useApiKeyDetailViewModel(keyId: string) {
  const qc = useQueryClient();
  const repo = integrationsContainer.apiKeyDetailRepository;

  // --- Detail Query ---
  const detailQuery = useQuery({
    queryKey: ["apikey-detail", keyId],
    queryFn: () => repo.getById(keyId),
    enabled: !!keyId,
    staleTime: 30_000,
  });

  // --- Stats Query (auto-refresh every 30s) ---
  const statsQuery = useQuery({
    queryKey: ["apikey-stats", keyId],
    queryFn: () => repo.getStats(keyId),
    enabled: !!keyId,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  // --- Chart Data ---
  const [chartParams, setChartParams] = useState<ChartParams>(() => ({
    granularity: "hourly",
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  }));

  const chartQuery = useQuery({
    queryKey: ["apikey-chart", keyId, chartParams],
    queryFn: () => repo.getChartData(keyId, chartParams),
    enabled: !!keyId,
    staleTime: 60_000,
  });

  // --- Activity Log ---
  const [activityParams, setActivityParams] = useState<ActivityParams>({
    page: 1,
    pageSize: 50,
  });

  const activityQuery = useQuery({
    queryKey: ["apikey-activity", keyId, activityParams],
    queryFn: () => repo.getActivity(keyId, activityParams),
    enabled: !!keyId,
    staleTime: 30_000,
  });

  // --- Generated Key state (after rotation) ---
  const [rotatedKey, setRotatedKey] = useState<CreateApiKeyResult | null>(null);

  // --- Mutations ---
  const updateMutation = useMutation({
    mutationFn: (request: UpdateApiKeyDetailRequest) => repo.update(keyId, request),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apikey-detail", keyId] });
    },
  });

  const rotateMutation = useMutation({
    mutationFn: () => repo.rotate(keyId),
    onSuccess: (result) => {
      setRotatedKey(result);
      qc.invalidateQueries({ queryKey: ["apikey-detail", keyId] });
    },
  });

  const handleChartRangeChange = useCallback((preset: "24h" | "7d" | "30d") => {
    const now = new Date();
    const map = { "24h": 1, "7d": 7, "30d": 30 };
    const days = map[preset];
    setChartParams(prev => ({
      ...prev,
      granularity: preset === "24h" ? "hourly" : "daily",
      startDate: new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString(),
      endDate: now.toISOString(),
    }));
  }, []);

  const handleActivityPageChange = useCallback((page: number) => {
    setActivityParams(prev => ({ ...prev, page }));
  }, []);

  const handleActivityFilterChange = useCallback((filters: Partial<ActivityParams>) => {
    setActivityParams(prev => ({ ...prev, ...filters, page: 1 }));
  }, []);

  const handleActivitySortChange = useCallback((sortBy: string, sortDesc: boolean) => {
    setActivityParams(prev => ({ ...prev, sortBy, sortDesc, page: 1 }));
  }, []);

  return {
    // Data
    detail: detailQuery.data,
    stats: statsQuery.data,
    chartData: chartQuery.data ?? [],
    activity: activityQuery.data,
    rotatedKey,
    // Loading states
    isDetailLoading: detailQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    isChartLoading: chartQuery.isLoading,
    isActivityLoading: activityQuery.isLoading,
    // Errors
    detailError: detailQuery.error,
    // Mutations
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    rotate: rotateMutation.mutate,
    isRotating: rotateMutation.isPending,
    // Params/Controls
    chartParams,
    setChartParams,
    activityParams,
    handleChartRangeChange,
    handleActivityPageChange,
    handleActivityFilterChange,
    handleActivitySortChange,
    // Clear rotated key after dialog is closed
    clearRotatedKey: () => setRotatedKey(null),
  };
}
