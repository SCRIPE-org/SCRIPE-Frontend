"use client";

/**
 * useAccountActivityConsoleViewModel
 *
 * Orchestrates server-paginated forensic audit filtering, debounced search,
 * UTC date-window presets, drawer inspection, and localized CSV export for
 * the Account Activity console.
 */
import { useEffect, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import type { SecurityAuditEntry } from "../../domain/entities/SecurityAuditEntry";
import type {
  SovereignActivityQuery,
  SovereignAuditEntry,
} from "../../domain/entities/SovereignAccountEntities";
import {
  buildKnownActivityCategories,
  computeDateBounds,
  exportActivityCsv,
  toForensicEntry,
  type ActivityOutcomeFilter,
  type DateRangePreset,
} from "../utils/activity-console.utils";
import { useAccountActivitySliceViewModel } from "./useSovereignAccountSlicesViewModel";

/**
 * Configuration options for `useAccountActivityConsoleViewModel`.
 */
export interface AccountActivityConsoleOptions {
  initialPageSize?: number;
  searchDebounceMs?: number;
}

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_SEARCH_DEBOUNCE_MS = 250;

/**
 * ViewModel hook managing state, server queries, forensic drawer state, and CSV export
 * for the Account Activity console view.
 */
export function useAccountActivityConsoleViewModel(
  options?: AccountActivityConsoleOptions
) {
  const { t } = useI18n();
  const pageSize = options?.initialPageSize ?? DEFAULT_PAGE_SIZE;
  const searchDebounceMs = options?.searchDebounceMs ?? DEFAULT_SEARCH_DEBOUNCE_MS;

  const [searchInput, setSearchInputState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilterState] = useState<string>("ALL");
  const [outcomeFilter, setOutcomeFilterState] =
    useState<ActivityOutcomeFilter>("ALL");
  const [datePreset, setDatePresetState] = useState<DateRangePreset>("ALL");
  const [presetAnchorMs, setPresetAnchorMs] = useState<number>(() => Date.now());
  const [customFromLocal, setCustomFromLocalState] = useState("");
  const [customToLocal, setCustomToLocalState] = useState("");
  const [page, setPage] = useState(1);

  const [selectedEntry, setSelectedEntry] = useState<SecurityAuditEntry | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === debouncedSearch) return;
    const handle = setTimeout(() => {
      setDebouncedSearch(trimmed);
      setPage(1);
    }, searchDebounceMs);
    return () => clearTimeout(handle);
  }, [searchInput, debouncedSearch, searchDebounceMs]);

  const dateBounds = computeDateBounds(
    datePreset,
    customFromLocal,
    customToLocal,
    presetAnchorMs
  );

  const query: SovereignActivityQuery = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(categoryFilter !== "ALL" ? { category: categoryFilter } : {}),
    ...(outcomeFilter !== "ALL" ? { outcome: outcomeFilter } : {}),
    ...(dateBounds.fromUtc ? { fromUtc: dateBounds.fromUtc } : {}),
    ...(dateBounds.toUtc ? { toUtc: dateBounds.toUtc } : {}),
    page,
    pageSize,
  };

  const {
    activity,
    isLoadingActivity,
    isFetchingActivity,
    isActivityError,
    activityError,
    refetchActivity,
  } = useAccountActivitySliceViewModel(query);

  const entries = activity?.entries ?? [];
  const totalEntries = activity?.totalEntries ?? entries.length;
  const hasMore =
    activity?.hasMore ?? page * (activity?.pageSize ?? pageSize) < totalEntries;
  const knownCategories = buildKnownActivityCategories(entries);

  const setSearchInput = (value: string) => {
    setSearchInputState(value);
  };

  const setCategoryFilter = (category: string) => {
    setCategoryFilterState(category || "ALL");
    setPage(1);
  };

  const setOutcomeFilter = (outcome: ActivityOutcomeFilter) => {
    setOutcomeFilterState(outcome);
    setPage(1);
  };

  const setDatePreset = (preset: DateRangePreset) => {
    setPresetAnchorMs(Date.now());
    setDatePresetState(preset);
    setPage(1);
  };

  const setCustomFromLocal = (value: string) => {
    setCustomFromLocalState(value);
    setPage(1);
  };

  const setCustomToLocal = (value: string) => {
    setCustomToLocalState(value);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchInputState("");
    setDebouncedSearch("");
    setCategoryFilterState("ALL");
    setOutcomeFilterState("ALL");
    setPresetAnchorMs(Date.now());
    setDatePresetState("ALL");
    setCustomFromLocalState("");
    setCustomToLocalState("");
    setPage(1);
  };

  const goToPreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const inspectEntry = (entry: SovereignAuditEntry) => {
    setSelectedEntry(
      toForensicEntry(entry, t("profile.activity.defaultActor"))
    );
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEntry(null);
  };

  const refreshActivity = () => {
    setPresetAnchorMs(Date.now());
    return refetchActivity();
  };

  const exportCsv = () => {
    exportActivityCsv(entries, page, {
      successOutcome: t("profile.audit.statusSuccess"),
      failureOutcome: t("profile.audit.statusFailure"),
    });
  };

  return {
    activity,
    entries,
    totalEntries,
    hasMore,
    knownCategories,
    chainIntegrityStatus: activity?.chainIntegrityStatus ?? "",
    isLoadingActivity,
    isFetchingActivity,
    isActivityError,
    activityError,
    searchInput,
    setSearchInput,
    debouncedSearch,
    categoryFilter,
    setCategoryFilter,
    outcomeFilter,
    setOutcomeFilter,
    datePreset,
    setDatePreset,
    customFromLocal,
    setCustomFromLocal,
    customToLocal,
    setCustomToLocal,
    dateBounds,
    page,
    pageSize,
    setPage,
    goToPreviousPage,
    goToNextPage,
    resetFilters,
    selectedEntry,
    isDrawerOpen,
    inspectEntry,
    closeDrawer,
    refreshActivity,
    exportCsv,
  };
}
