"use client";

import * as React from "react";
import { appLogger } from "@core/common/logger";
import type { GenericSelectOption } from "../generic-select";

/**
 * The option engine behind GenericSelect.
 *
 * Everything that is *data* — normalisation, the lookup map, the selected-label
 * cache, debounced server search, tree flattening — lives here so the three
 * view files stay presentational. The previous implementation interleaved all
 * of this with hand-rolled popper maths in one 1369-line component.
 */

export type SelectSearchType = "client" | "server";

export interface UseSelectOptionsArgs {
  options: GenericSelectOption[];
  value?: string | string[];
  isTreeSelect: boolean;
  searchType: SelectSearchType;
  onServerSearch?: (query: string) => Promise<GenericSelectOption[]>;
  debounceMs: number;
  treeData?: GenericSelectOption[];
  onTreeDataLoad?: () => Promise<GenericSelectOption[]>;
  expandedKeys: string[];
  isOpen: boolean;
}

const dedupeByValue = (list: GenericSelectOption[]): GenericSelectOption[] => {
  const seen = new Set<string>();
  return list.filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
};

const flattenTree = (
  nodes: GenericSelectOption[],
  expanded: string[],
  level = 0
): GenericSelectOption[] => {
  const flat: GenericSelectOption[] = [];
  nodes.forEach((node) => {
    flat.push({ ...node, level });
    if (node.children?.length && expanded.includes(node.value)) {
      flat.push(...flattenTree(node.children, expanded, level + 1));
    }
  });
  return flat;
};

const collectTreeNodes = (nodes: GenericSelectOption[]): GenericSelectOption[] => {
  const all: GenericSelectOption[] = [];
  nodes.forEach((node) => {
    all.push(node);
    if (node.children?.length) all.push(...collectTreeNodes(node.children));
  });
  return all;
};

export function useSelectOptions({
  options,
  value,
  isTreeSelect,
  searchType,
  onServerSearch,
  debounceMs,
  treeData,
  onTreeDataLoad,
  expandedKeys,
  isOpen,
}: UseSelectOptionsArgs) {
  const [query, setQuery] = React.useState("");
  const [serverOptions, setServerOptions] = React.useState<GenericSelectOption[]>([]);
  // Server mode starts busy. Otherwise the very first paint has no options and
  // no in-flight flag, so the panel showed a confident "nothing here" empty
  // state for the whole debounce window before the first request even fired.
  const [isSearching, setIsSearching] = React.useState(searchType === "server");
  // The error channel the old implementation did not have: all three server
  // failure paths swallowed the rejection and set [], so a 500 was
  // indistinguishable from "no matches" and offered no way to retry.
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [loadedTreeData, setLoadedTreeData] = React.useState<GenericSelectOption[] | null>(null);

  // Selected labels are cached so a value stays readable after a server search
  // pages its results away.
  const [selectedLabelMap, setSelectedLabelMap] = React.useState<Map<string, GenericSelectOption>>(
    () => new Map()
  );

  const currentValues = React.useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value]
  );

  const treeSource = React.useMemo(
    () => (isTreeSelect ? (loadedTreeData ?? treeData ?? options) : []),
    [isTreeSelect, loadedTreeData, treeData, options]
  );

  // value -> chain of ancestor labels, root first. Used both to auto-open the
  // branch holding a preset value and to show the full path in the field: two
  // sibling nodes under different parents are otherwise indistinguishable once
  // the panel is closed.
  const ancestorMap = React.useMemo(() => {
    const map = new Map<string, { values: string[]; labels: string[] }>();
    const walk = (nodes: GenericSelectOption[], values: string[], labels: string[]) => {
      nodes.forEach((node) => {
        map.set(node.value, { values, labels });
        if (node.children?.length) {
          walk(node.children, [...values, node.value], [...labels, node.label]);
        }
      });
    };
    if (isTreeSelect) walk(treeSource, [], []);
    return map;
  }, [isTreeSelect, treeSource]);

  /** Keys that must be open for every current selection to be on screen. */
  const ancestorKeys = React.useMemo(() => {
    if (!isTreeSelect) return [] as string[];
    const keys = new Set<string>();
    currentValues.forEach((val) => ancestorMap.get(val)?.values.forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [isTreeSelect, currentValues, ancestorMap]);

  const effectiveExpandedKeys = React.useMemo(
    () => (isTreeSelect ? Array.from(new Set([...expandedKeys, ...ancestorKeys])) : expandedKeys),
    [isTreeSelect, expandedKeys, ancestorKeys]
  );

  const flattenedTreeOptions = React.useMemo(
    () => (isTreeSelect ? flattenTree(treeSource, effectiveExpandedKeys) : []),
    [isTreeSelect, treeSource, effectiveExpandedKeys]
  );

  /** "Region › District › Branch" for a tree value; the bare label otherwise. */
  const pathLabelFor = React.useCallback(
    (option: GenericSelectOption): string => {
      if (!isTreeSelect) return option.label;
      const labels = ancestorMap.get(option.value)?.labels ?? [];
      return labels.length ? [...labels, option.label].join(" › ") : option.label;
    },
    [isTreeSelect, ancestorMap]
  );

  const allOptionsMap = React.useMemo(() => {
    const map = new Map<string, GenericSelectOption>();
    const add = (list: GenericSelectOption[]) => {
      list.forEach((option) => {
        map.set(option.value, option);
        if (option.children?.length) add(option.children);
      });
    };
    add(options || []);
    selectedLabelMap.forEach((option, key) => map.set(key, option));
    add(serverOptions);
    if (isTreeSelect) {
      add(flattenedTreeOptions);
      add(collectTreeNodes(treeSource));
    }
    return map;
  }, [options, serverOptions, isTreeSelect, flattenedTreeOptions, treeSource, selectedLabelMap]);

  // Sync options matching currentValues into cache to persist labels across server searches
  if (options && options.length > 0) {
    const matches = options.filter((opt) => currentValues.includes(opt.value));
    if (matches.length > 0) {
      const hasNew = matches.some((opt) => !selectedLabelMap.has(opt.value));
      if (hasNew) {
        const next = new Map(selectedLabelMap);
        for (const opt of matches) {
          next.set(opt.value, opt);
        }
        setSelectedLabelMap(next);
      }
    }
  }

  const selectedOptions = React.useMemo(
    () =>
      currentValues.map(
        (val) =>
          allOptionsMap.get(val) ??
          // Fall back to empty label, never to a raw ciphertext ID string.
          // When options has not loaded yet, placeholder will be shown until
          // the resolved entity name arrives from the server.
          ({ value: val, label: "" } as GenericSelectOption)
      ),
    [currentValues, allOptionsMap]
  );

  // Client-side filtering. Tree mode filters the flattened rows so a match deep
  // in the tree is still reachable.
  const displayOptions = React.useMemo(() => {
    if (searchType === "server") return serverOptions;
    const clientPool = isTreeSelect ? flattenedTreeOptions : options || [];
    if (!query.trim()) return clientPool;
    const needle = query.trim().toLowerCase();
    return clientPool.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) ||
        option.description?.toLowerCase().includes(needle)
    );
  }, [searchType, serverOptions, query, isTreeSelect, flattenedTreeOptions, options]);

  const runServerSearch = React.useCallback(
    async (nextQuery: string) => {
      if (!onServerSearch) return;
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await onServerSearch(nextQuery);
        setServerOptions(dedupeByValue(results));
      } catch (error) {
        appLogger.error("Select server search failed", error);
        setSearchError(error instanceof Error ? error.message : String(error));
      } finally {
        setIsSearching(false);
      }
    },
    [onServerSearch]
  );

  // Initial server load, on MOUNT — deliberately not gated on the panel being
  // open. A server-backed select is usually rendered with a value already set
  // (an edit form), and its labels live in the server response: gating this on
  // open meant every preset value rendered as a raw GUID in the closed field
  // until the user happened to click it.
  const preloadedRef = React.useRef(false);
  React.useEffect(() => {
    if (searchType !== "server" || !onServerSearch || preloadedRef.current) return;
    preloadedRef.current = true;
    void runServerSearch("");
  }, [searchType, onServerSearch, runServerSearch]);

  // Debounced server search on query change. The setState calls all happen
  // inside async callbacks, never synchronously in the effect body.
  React.useEffect(() => {
    if (searchType !== "server" || !onServerSearch || !isOpen || !query) return;
    const timer = setTimeout(() => {
      void runServerSearch(query);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [query, searchType, onServerSearch, isOpen, debounceMs, runServerSearch]);

  // Lazy tree load, once, on first open.
  React.useEffect(() => {
    if (!isTreeSelect || !onTreeDataLoad || !isOpen || loadedTreeData) return;
    let cancelled = false;
    void onTreeDataLoad()
      .then((data) => {
        if (!cancelled) setLoadedTreeData(data);
      })
      .catch((error) => {
        appLogger.error("Select tree data load failed", error);
      });
    return () => {
      cancelled = true;
    };
  }, [isTreeSelect, onTreeDataLoad, isOpen, loadedTreeData]);

  /** Remember an option's label so it survives a later server page turn. */
  const rememberOption = React.useCallback((option: GenericSelectOption | undefined) => {
    if (option) {
      setSelectedLabelMap((prev) => {
        if (prev.has(option.value)) return prev;
        const next = new Map(prev);
        next.set(option.value, option);
        return next;
      });
    }
  }, []);

  /**
   * Selection comparison. `uniqueKey`, when an option carries one, overrides
   * `value` — permissions and roles keep a stable code while their id rotates
   * between requests, and comparing on the id alone loses the selection.
   */
  const findSelectedMatch = React.useCallback(
    (option: GenericSelectOption): string | undefined => {
      if (option.uniqueKey) {
        return currentValues.find((val) => allOptionsMap.get(val)?.uniqueKey === option.uniqueKey);
      }
      return currentValues.includes(option.value) ? option.value : undefined;
    },
    [currentValues, allOptionsMap]
  );

  const isOptionSelected = React.useCallback(
    (option: GenericSelectOption) => findSelectedMatch(option) !== undefined,
    [findSelectedMatch]
  );

  const resetQuery = React.useCallback(() => setQuery(""), []);

  return {
    query,
    setQuery,
    resetQuery,
    currentValues,
    selectedOptions,
    displayOptions,
    flattenedTreeOptions,
    allOptionsMap,
    isSearching,
    searchError,
    retrySearch: () => void runServerSearch(query),
    rememberOption,
    findSelectedMatch,
    isOptionSelected,
    effectiveExpandedKeys,
    pathLabelFor,
  };
}
