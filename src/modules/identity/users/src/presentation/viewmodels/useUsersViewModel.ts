"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { systemContainer } from "@modules/identity/di";

export function useUsersViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { usersRepository } = systemContainer;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users", page, pageSize, search],
    queryFn: () => usersRepository.getAll({ page, pageSize, search: search || undefined }),
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
