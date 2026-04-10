"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ecosystemContainer } from "@modules/ecosystem/di";

export function useDeveloperViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { developerRepository } = ecosystemContainer;

  // Base list query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["developer", page, pageSize, search],
    queryFn: () => developerRepository.getAll({ page, pageSize, search: search || undefined }),
  });

  // Overview (API stats)
  const overviewQuery = useQuery({
    queryKey: ["developer", "overview"],
    queryFn: () => developerRepository.getOverview(),
  });

  // Webhook events list
  const webhookEventsQuery = useQuery({
    queryKey: ["developer", "webhook-events"],
    queryFn: () => developerRepository.getWebhookEvents(),
  });

  // SDK examples
  const sdkExamplesQuery = useQuery({
    queryKey: ["developer", "sdk-examples"],
    queryFn: () => developerRepository.getSdkExamples(),
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: (url: string) => developerRepository.testWebhook(url),
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    items: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading: isLoading || overviewQuery.isLoading,
    error: error || overviewQuery.error,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    handleSearch,
    refetch,

    // Portal-specific data
    overview: overviewQuery.data ?? {},
    webhookEvents: Array.isArray(webhookEventsQuery.data) ? webhookEventsQuery.data : (webhookEventsQuery.data as any)?.events ?? [],
    sdkExamples: sdkExamplesQuery.data ?? {},

    // Webhook test
    testWebhook: testWebhookMutation.mutateAsync,
    isTestingWebhook: testWebhookMutation.isPending,
  };
}
