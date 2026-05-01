"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";
import type { InventoryParams } from "../../domain/interfaces/IInventoryService";

export function useInventoryViewModel() {
  const { inventoryRepository } = complianceContainer;
  const [params, setParams] = useState<InventoryParams>({ page: 1, pageSize: 50 });

  const query = useQuery({
    queryKey: ["compliance", "inventory", params],
    queryFn: () => inventoryRepository.getAll(params),
    staleTime: 120_000,
    retry: false,
  });

  return {
    items: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    search: params.search ?? "",
    setSearch: (search: string) => setParams(p => ({ ...p, search: search || undefined, page: 1 })),
    setPage: (page: number) => setParams(p => ({ ...p, page })),
  };
}
