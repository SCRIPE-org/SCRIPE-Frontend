/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, UseQueryOptions, keepPreviousData } from "@tanstack/react-query";
import { PaginatedResult } from "../types";

export function useGenericQuery<T, TParams = any>(
  key: any[],
  fetcher: (params: TParams) => Promise<PaginatedResult<T>>,
  params: TParams,
  enabled: boolean = true,
  options?: Omit<UseQueryOptions<PaginatedResult<T>>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => fetcher(params),
    enabled,
    placeholderData: keepPreviousData,
    ...options,
  });
}
