"use client";

/**
 * Activity Log ViewModel
 *
 * Handles paginated security activity log.
 */
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { container } from "@modules/profile/di";
import { profileKeys } from "./useProfilePageViewModel";
import type { SecurityLogEntry } from "../../domain/entities/SecurityLogEntry";

/**
 * React hook/ViewModel managing logic, state, and repository queries for activity log view model.
 */
export function useActivityLogViewModel() {
  const repo = container.profileRepository;
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const {
    data: entries,
    isLoading,
    error,
  } = useQuery({
    queryKey: profileKeys.securityLog(page),
    queryFn: () => repo.getSecurityLog(page, pageSize),
    staleTime: 60 * 1000,
  });

  // Group entries by date
  const groupedEntries = (entries ?? []).reduce<Record<string, SecurityLogEntry[]>>(
    (groups, entry) => {
      if (!entry) return groups;
      const dateKey = entry.timestamp.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
      return groups;
    },
    {}
  );

  return {
    entries,
    groupedEntries,
    isLoading,
    error: error?.message ?? null,

    page,
    setPage,
    pageSize,
    hasMore: (entries?.length ?? 0) >= pageSize,
  };
}
