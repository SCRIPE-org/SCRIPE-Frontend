"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";

export function useBillingViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { billingRepository } = entitlementsContainer;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["billing", page, pageSize, search],
    queryFn: () => billingRepository.getAll({ page, pageSize, search: search || undefined }),
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    items: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    handleSearch,
    refetch,
  };
}
