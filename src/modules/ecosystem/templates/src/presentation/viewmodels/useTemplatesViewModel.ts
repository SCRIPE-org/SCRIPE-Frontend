"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ecosystemContainer } from "@modules/ecosystem/di";

export function useTemplatesViewModel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { templatesRepository } = ecosystemContainer;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["templates", page, pageSize, search],
    queryFn: () => templatesRepository.getAll({ page, pageSize, search: search || undefined }),
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
