/**
 * AnalyticsEvent ViewModel
 *
 * Handles presentation logic and state for the Analytics Event Stream View.
 * Strictly communicates with data layer via Repository interface from DI container.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { analyticsContainer } from "../../../../di";
import type { AnalyticsEvent } from "../../domain/entities/AnalyticsEvent";

export function useAnalyticsEventViewModel() {
  const { analyticsEventRepository } = analyticsContainer;

  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 20;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsEventRepository.getAll({ page, pageSize });
      setEvents(res.items ?? []);
      setTotalCount(res.totalCount ?? 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load events";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, analyticsEventRepository]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchEvents();
    });
  }, [fetchEvents]);

  return {
    events,
    totalCount,
    page,
    setPage,
    loading,
    error,
    pageSize,
    refresh: fetchEvents,
  };
}
