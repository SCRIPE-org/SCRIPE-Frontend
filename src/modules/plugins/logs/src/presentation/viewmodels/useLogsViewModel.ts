"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pluginsContainer } from "@modules/plugins/di";

const PAGE_SIZE = 20;

/**
 * React hook/ViewModel managing logic, state, and repository queries for logs view model.
 */
export function useLogsViewModel(installationId: string) {
  const { logsRepository } = pluginsContainer;
  const [page, setPage] = useState(1);

  const logs = useQuery({
    queryKey: ["plugins", "logs", installationId, page],
    queryFn: () => logsRepository.getLogs(installationId, page, PAGE_SIZE),
    enabled: !!installationId,
    staleTime: 30_000,
  });

  return {
    logs: logs.data?.items ?? [],
    totalCount: logs.data?.totalCount ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((logs.data?.totalCount ?? 0) / PAGE_SIZE),
    isLoading: logs.isLoading,
    isError: logs.isError,
    refetch: logs.refetch,
    goToPage: setPage,
  };
}
