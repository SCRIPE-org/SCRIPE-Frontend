"use client";

import React from "react";
import { ChevronDown, X, Search, Check, ChevronRight, SearchX } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { EmptyState } from "@core/ui/empty-state";
import { Input } from "@core/ui/input";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  getGenericSelectStyles,
  ResponsiveChip,
  SELECT_ITEM,
  SELECT_ITEM_DISABLED,
  SELECT_ITEM_SELECTED,
} from "./generic-select-base";
import { appLogger } from "@core/common/logger";

export interface GenericSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  children?: GenericSelectOption[];
  level?: number;
  parentId?: string | null;
  /**
   * Unique key for deduplication when value may change between API calls.
   * If provided, selection comparison uses this instead of value.
   * Example: permission code "admins.assign_roles" stays stable while ID rotates.
   */
  uniqueKey?: string;
}

export interface GenericSelectProps {
  // Core props
  options: GenericSelectOption[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;

  // Select type configuration
  type?: "single" | "searchable" | "multi" | "tree";

  // Search configuration (for searchable and multi types)
  searchable?: boolean;
  searchPlaceholder?: string;
  searchType?: "client" | "server";
  onServerSearch?: (query: string) => Promise<GenericSelectOption[]>;
  searchEndpoint?: string;
  debounceMs?: number;
  noResultsText?: string;
  searchingText?: string;

  // Multi-select specific
  maxSelectedDisplay?: number;
  selectAllText?: string;
  clearAllText?: string;
  selectedText?: string;
  allowClear?: boolean;

  // Loading state
  loading?: boolean;

  // Tree-select specific
  treeData?: GenericSelectOption[];
  onTreeDataLoad?: () => Promise<GenericSelectOption[]>;
  expandedKeys?: string[];
  onExpandedKeysChange?: (keys: string[]) => void;
  showFullPath?: boolean;

  // Additional props
  [key: string]: any;
}

export const GenericSelect = React.forwardRef<HTMLDivElement, GenericSelectProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder,
      disabled = false,
      className,
      type = "single",
      searchable = false,
      searchPlaceholder,
      searchType = "client",
      onServerSearch,
      searchEndpoint,
      debounceMs = 300,
      noResultsText,
      searchingText,
      maxSelectedDisplay = 3,
      selectAllText,
      clearAllText,
      selectedText,
      allowClear = true,
      loading = false,
      treeData,
      onTreeDataLoad,
      expandedKeys = [],
      onExpandedKeysChange,
      showFullPath = false,
      ...props
    },
    ref
  ) => {
    const { direction, t } = useI18n();

    // The combobox has to name the popup it controls; the popup lives in a
    // portal, so the id is the only link between them.
    const listboxId = `${React.useId()}-listbox`;

    // Determine if this is a multi-select based on type or value array
    const isMultiSelect = type === "multi" || Array.isArray(value);
    const isSearchable = type === "searchable" || searchable || type === "multi" || type === "tree";
    const isTreeSelect = type === "tree";

    // Default localized text values
    const defaultPlaceholder =
      placeholder ||
      (isMultiSelect
        ? t("components.multiSelect.placeholders.selectTechnologies")
        : t("components.select.placeholder"));
    const defaultSearchPlaceholder =
      searchPlaceholder ||
      (isMultiSelect
        ? t("components.multiSelect.placeholders.searchTechnologies")
        : t("components.searchableSelect.placeholder"));
    const defaultNoResultsText =
      noResultsText || t("components.multiSelect.searchStates.noResults");
    const defaultSearchingText =
      searchingText || t("components.multiSelect.searchStates.searching");
    const defaultSelectAllText = selectAllText || t("components.multiSelect.buttons.selectAll");
    const defaultClearAllText = clearAllText || t("components.multiSelect.buttons.clearAll");
    const defaultSelectedText = selectedText || t("components.multiSelect.searchStates.selected");

    // State management
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [filteredOptions, setFilteredOptions] = React.useState<GenericSelectOption[]>(
      options || []
    );
    const [isSearching, setIsSearching] = React.useState(false);
    const [serverOptions, setServerOptions] = React.useState<GenericSelectOption[]>([]);
    // Cache for selected options - persists labels even when serverOptions changes
    const [selectedOptionsCache, setSelectedOptionsCache] = React.useState<
      Map<string, GenericSelectOption>
    >(new Map());
    const [dropdownPosition, setDropdownPosition] = React.useState({
      top: 0,
      left: 0,
      width: 0,
      maxHeight: 240,
    });
    const shouldShowAboveRef = React.useRef(false);
    const [animateOpen, setAnimateOpen] = React.useState(false);
    const [internalExpandedKeys, setInternalExpandedKeys] = React.useState<string[]>(expandedKeys);
    const [flattenedTreeOptions, setFlattenedTreeOptions] = React.useState<GenericSelectOption[]>(
      []
    );

    // Refs
    const containerRef = React.useRef<HTMLDivElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const triggerRef = React.useRef<HTMLDivElement | null>(null);
    const debounceRef = React.useRef<NodeJS.Timeout | null>(null);
    const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(
      typeof document !== "undefined" ? document.body : null
    );

    // Tree-specific functions
    const flattenTreeData = React.useCallback(
      (treeNodes: GenericSelectOption[], level = 0): GenericSelectOption[] => {
        const flattened: GenericSelectOption[] = [];

        treeNodes.forEach((node) => {
          const flatNode = { ...node, level };
          flattened.push(flatNode);

          if (node.children && internalExpandedKeys.includes(node.value)) {
            flattened.push(...flattenTreeData(node.children, level + 1));
          }
        });

        return flattened;
      },
      [internalExpandedKeys]
    );

    const getNodePath = React.useCallback(
      (nodeValue: string, treeNodes: GenericSelectOption[]): string[] => {
        const findPath = (
          nodes: GenericSelectOption[],
          targetValue: string,
          currentPath: string[] = []
        ): string[] | null => {
          for (const node of nodes) {
            const newPath = [...currentPath, node.label];
            if (node.value === targetValue) {
              return newPath;
            }
            if (node.children) {
              const childPath = findPath(node.children, targetValue, newPath);
              if (childPath) return childPath;
            }
          }
          return null;
        };

        return findPath(treeNodes, nodeValue) || [nodeValue];
      },
      []
    );

    // Get parent node values for auto-expansion
    const getParentNodeValues = React.useCallback(
      (nodeValue: string, treeNodes: GenericSelectOption[]): string[] => {
        const findParents = (
          nodes: GenericSelectOption[],
          targetValue: string,
          currentPath: string[] = []
        ): string[] | null => {
          for (const node of nodes) {
            const newPath = [...currentPath, node.value];
            if (node.value === targetValue) {
              return currentPath; // Return path without the target node itself
            }
            if (node.children) {
              const childPath = findParents(node.children, targetValue, newPath);
              if (childPath) return childPath;
            }
          }
          return null;
        };

        return findParents(treeNodes, nodeValue) || [];
      },
      []
    );

    const toggleExpanded = (nodeValue: string) => {
      const newExpandedKeys = internalExpandedKeys.includes(nodeValue)
        ? internalExpandedKeys.filter((key) => key !== nodeValue)
        : [...internalExpandedKeys, nodeValue];

      setInternalExpandedKeys(newExpandedKeys);
      onExpandedKeysChange?.(newExpandedKeys);
    };

    // Get current values
    const currentValues = Array.isArray(value) ? value : value ? [value] : [];

    // For tree select, we need to search all nodes (not just expanded ones) to find selected options
    const getAllTreeNodes = React.useCallback(
      (treeNodes: GenericSelectOption[]): GenericSelectOption[] => {
        const allNodes: GenericSelectOption[] = [];

        const traverse = (nodes: GenericSelectOption[], level = 0) => {
          nodes.forEach((node) => {
            allNodes.push({ ...node, level });
            if (node.children) {
              traverse(node.children, level + 1);
            }
          });
        };

        traverse(treeNodes);
        return allNodes;
      },
      []
    );

    // Create a map of all available options for quick lookup
    const allOptionsMap = React.useMemo(() => {
      const map = new Map<string, GenericSelectOption>();

      const addToMap = (options: GenericSelectOption[]) => {
        options.forEach((option) => {
          map.set(option.value, option);
          if (option.children) {
            addToMap(option.children);
          }
        });
      };

      // Add static options
      addToMap(options || []);

      // Add cached selected options (important for server search)
      selectedOptionsCache.forEach((option, key) => {
        map.set(key, option);
      });

      // Add server options
      addToMap(serverOptions);

      // Add tree options
      if (isTreeSelect) {
        addToMap(flattenedTreeOptions);
        addToMap(getAllTreeNodes(treeData || options));
      }

      return map;
    }, [
      options,
      serverOptions,
      selectedOptionsCache,
      flattenedTreeOptions,
      treeData,
      isTreeSelect,
      getAllTreeNodes,
    ]);

    // Get selected options, including ones that might not be in the current options list
    const selectedOptions = React.useMemo(() => {
      return currentValues.map((value) => {
        // First try to find in the current options
        const option = allOptionsMap.get(value);
        if (option) {
          return option;
        }

        // If not found, show "Unknown" instead of the ID value
        // This prevents showing database IDs to users
        // IMPORTANT: This means the option's label wasn't pre-loaded
        // Solution: Always include the selected value in the options array BEFORE passing to GenericSelect
        return { value, label: t("common.unknown") || "Unknown" };
      });
    }, [currentValues, allOptionsMap, t]);

    // Get source options based on select type
    const sourceOptions = isTreeSelect ? flattenedTreeOptions : options;
    const allTreeNodes = isTreeSelect ? getAllTreeNodes(treeData || options) : [];

    // Get display options based on search type
    const displayOptions =
      (isTreeSelect
        ? searchType === "server"
          ? serverOptions
          : filteredOptions
        : searchType === "server"
          ? serverOptions
          : filteredOptions) || [];
    const showLoading = loading || isSearching;

    // Fixed positioning that stays attached to field with 1px seam (feels attached)
    const calculateDropdownPosition = React.useCallback(() => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate available space above and below
      const spaceBelow = viewportHeight - rect.bottom - 1; // 1px seam
      const spaceAbove = rect.top - 1; // 1px seam

      // Estimate content height based on current state and select type
      const itemHeight = isTreeSelect ? 50 : 40; // Tree items are taller due to enhanced design
      const searchHeight = isSearchable ? 45 : 0;
      const paddingHeight = 16;
      // Dynamic height approach for better positioning
      const maxDropdownHeight = isTreeSelect ? 320 : 280; // Maximum heights for scrolling
      const minDropdownHeight = 120; // Minimum height

      // Prefer showing below unless there's very little space
      const shouldShowAbove = spaceBelow < minDropdownHeight && spaceAbove > spaceBelow + 50;
      shouldShowAboveRef.current = shouldShowAbove;

      let top: number;
      let maxHeight: number;

      if (shouldShowAbove) {
        // Position above the field with 1px seam
        const availableAbove = spaceAbove - 10; // 10px margin from viewport top
        maxHeight = Math.min(maxDropdownHeight, availableAbove);
        // Ensure minimum height first, then calculate position
        maxHeight = Math.max(maxHeight, minDropdownHeight);
        top = rect.top - maxHeight - 1; // 1px seam above field
      } else {
        // Position below the field with 1px seam
        const availableBelow = spaceBelow - 10; // 10px margin from viewport bottom
        maxHeight = Math.min(maxDropdownHeight, availableBelow);
        maxHeight = Math.max(maxHeight, minDropdownHeight);
        top = rect.bottom + 1; // 1px seam below field
      }

      setDropdownPosition({
        top: Math.max(top, 1), // Minimum 10px from viewport top
        left: rect.left,
        width: rect.width,
        maxHeight: Math.floor(maxHeight),
      });
    }, [displayOptions?.length, showLoading, isSearchable, isTreeSelect]);

    // Portal root is always document.body, and tree data is initialised here.
    //
    // The old code tried to portal INTO the surrounding dialog by querying
    // `[data-radix-dialog-content]`. Nothing in the app emits that attribute —
    // Radix stamps `role="dialog"` plus `data-state` — so the branch was dead
    // and this always resolved to document.body anyway. Portalling into the
    // dialog would not have worked either: DialogContent carries a translate,
    // which makes it a containing block and would have re-anchored every
    // `fixed` panel to the wrong origin. Escaping the dialog is the z-ladder's
    // job (see tailwind.config.js zIndex.dropdown), not the portal target's.
    React.useEffect(() => {
      setPortalRoot(typeof document !== "undefined" ? document.body : null);

      if (isTreeSelect) {
        const dataToUse = treeData || options;
        if (onTreeDataLoad && dataToUse.length === 0) {
          onTreeDataLoad().then((data: GenericSelectOption[]) => {
            setFlattenedTreeOptions(flattenTreeData(data));
          });
        } else {
          setFlattenedTreeOptions(flattenTreeData(dataToUse));
        }
      }
    }, [isTreeSelect, treeData, options, flattenTreeData, onTreeDataLoad]);

    // Auto-expand parent nodes to show path to selected option when dropdown opens
    React.useEffect(() => {
      if (isTreeSelect && isOpen && currentValues.length > 0) {
        const dataToUse = treeData || options;
        if (dataToUse.length > 0) {
          const selectedValue = currentValues[0]; // Get first selected value
          const parentNodes = getParentNodeValues(selectedValue, dataToUse);

          if (parentNodes.length > 0) {
            // Merge existing expanded keys with parent nodes (avoid duplicates)
            const newExpandedKeys = Array.from(new Set([...internalExpandedKeys, ...parentNodes]));
            setInternalExpandedKeys(newExpandedKeys);
            onExpandedKeysChange?.(newExpandedKeys);
          }
        }
      }
    }, [
      isTreeSelect,
      isOpen,
      currentValues,
      treeData,
      options,
      getParentNodeValues,
      onExpandedKeysChange,
    ]);

    // Update flattened tree when expanded keys change
    React.useEffect(() => {
      if (isTreeSelect) {
        const dataToUse = treeData || options;
        setFlattenedTreeOptions(flattenTreeData(dataToUse));
      }
    }, [isTreeSelect, internalExpandedKeys, treeData, options, flattenTreeData]);

    // Client-side filtering with position recalculation
    React.useEffect(() => {
      if (searchType === "client" && searchQuery) {
        const sourceData = isTreeSelect ? flattenedTreeOptions : options;
        const filtered = sourceData.filter((option: GenericSelectOption) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredOptions(filtered);
      } else {
        const sourceData = isTreeSelect ? flattenedTreeOptions : options;
        setFilteredOptions(sourceData);
      }

      // Recalculate position when content changes
      if (isOpen) {
        setTimeout(() => calculateDropdownPosition(), 10);
      }
    }, [
      searchQuery,
      options,
      flattenedTreeOptions,
      searchType,
      isTreeSelect,
      isOpen,
      calculateDropdownPosition,
    ]);

    // Refs for callback functions to prevent unnecessary re-renders
    // Must be defined before useEffects that use them
    const onServerSearchRef = React.useRef(onServerSearch);
    onServerSearchRef.current = onServerSearch;
    const hasLoadedInitialServerOptions = React.useRef(false);

    // Server-side search with debouncing
    React.useEffect(() => {
      // Only trigger on actual search query changes, not on every render
      if (searchType !== "server") return;

      if (searchQuery.trim()) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
          setIsSearching(true);
          try {
            let finalResults: GenericSelectOption[] = [];
            // Use ref to get latest callback without re-triggering effect
            if (onServerSearchRef?.current) {
              finalResults = await onServerSearchRef.current(searchQuery);
            } else if (searchEndpoint) {
              const response = await fetch(
                `${searchEndpoint}?q=${encodeURIComponent(searchQuery)}`
              );
              finalResults = await response.json();
            }

            // Deduplicate results by value
            const seen = new Set<string>();
            const unique = finalResults.filter((r) => {
              if (seen.has(r.value)) return false;
              seen.add(r.value);
              return true;
            });
            setServerOptions(unique);
          } catch (error) {
            appLogger.error("Server search error:", error);
            setServerOptions([]);
          } finally {
            setIsSearching(false);
          }
        }, debounceMs);
      } else {
        // Clear search - reload initial data
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        setIsSearching(false);
      }

      // Cleanup on unmount
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [searchQuery, searchType, searchEndpoint, debounceMs]); // Removed onServerSearch and options

    // Initialize server options and load initial data

    React.useEffect(() => {
      if (searchType === "server") {
        // Load initial data only once when component mounts (if onServerSearch is available)
        if (onServerSearchRef.current && !hasLoadedInitialServerOptions.current) {
          hasLoadedInitialServerOptions.current = true;
          // If static options were provided, show them while loading
          if (options.length > 0) {
            setServerOptions(options);
          }
          setIsSearching(true);
          onServerSearchRef
            .current("")
            .then((results: GenericSelectOption[]) => {
              // Deduplicate results by value
              const seen = new Set<string>();
              const unique = results.filter((r) => {
                if (seen.has(r.value)) return false;
                seen.add(r.value);
                return true;
              });
              setServerOptions(unique);
              setIsSearching(false);
            })
            .catch((error: any) => {
              appLogger.error("Failed to load initial server options:", error);
              setServerOptions([]);
              setIsSearching(false);
            });
        } else if (!hasLoadedInitialServerOptions.current && options.length > 0) {
          // No onServerSearch callback — use static options (deduplicated)
          const seen = new Set<string>();
          const unique = options.filter((o: GenericSelectOption) => {
            if (seen.has(o.value)) return false;
            seen.add(o.value);
            return true;
          });
          setServerOptions(unique);
        }
        // After initial load, do NOT overwrite serverOptions from prop changes.
        // The onServerSearch callback is the source of truth for server-search mode.
      }
    }, [options, searchType]); // Removed onServerSearch from deps - using ref instead

    // Recalculate position when server options change
    React.useEffect(() => {
      if (searchType === "server" && isOpen) {
        setTimeout(() => calculateDropdownPosition(), 10);
      }
    }, [serverOptions, searchType, isOpen, calculateDropdownPosition]);

    // Robust focus management: when dropdown opens, immediately transfer focus to search input
    React.useLayoutEffect(() => {
      if (!isOpen || !isSearchable) return;

      // Store the currently focused element before opening (if any)
      const previouslyFocused = document.activeElement as HTMLElement;

      const attempts: number[] = [];
      const tryFocus = () => {
        // Wait for dropdown to be in DOM before focusing
        if (
          searchInputRef.current &&
          dropdownRef.current &&
          document.body.contains(searchInputRef.current)
        ) {
          try {
            // Use focus() with preventScroll and explicitly request focus
            searchInputRef.current.focus({ preventScroll: true });
            // Also dispatch a focus event to ensure it's recognized
            searchInputRef.current.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
          } catch (err) {
            // Silently fail if focus is blocked
          }
        }
      };

      // Wait a bit for the dropdown to render, then aggressively try to focus
      // Start after dropdown is likely rendered
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(tryFocus);
        attempts.push(raf2 as any);
      });

      // Multiple staggered attempts to beat any focus trap delays
      attempts.push(
        window.setTimeout(tryFocus, 20),
        window.setTimeout(tryFocus, 50),
        window.setTimeout(tryFocus, 100),
        window.setTimeout(tryFocus, 150),
        window.setTimeout(tryFocus, 250)
      );

      return () => {
        cancelAnimationFrame(raf1);
        attempts.forEach((id) => {
          if (typeof id === "number") {
            clearTimeout(id);
          } else {
            cancelAnimationFrame(id);
          }
        });
        // When closing, return focus to the trigger element if it exists
        if (!isOpen && triggerRef.current) {
          requestAnimationFrame(() => {
            try {
              triggerRef.current?.focus();
            } catch {}
          });
        } else if (!isOpen && previouslyFocused && previouslyFocused.focus) {
          // Fallback: return to previously focused element
          requestAnimationFrame(() => {
            try {
              previouslyFocused.focus();
            } catch {}
          });
        }
      };
    }, [isOpen, isSearchable]);

    // Get Generic styling
    const styles = getGenericSelectStyles(disabled, className);

    // Handle selection
    const handleSelect = (optionValue: string) => {
      if (!onValueChange) return;

      // Get the selected option for caching and uniqueKey lookup
      const selectedOption = allOptionsMap.get(optionValue);

      // Cache the selected option to preserve its label
      if (selectedOption && !selectedOptionsCache.has(optionValue)) {
        setSelectedOptionsCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(optionValue, selectedOption);
          return newCache;
        });
      }

      if (isMultiSelect) {
        // For deduplication: use uniqueKey if available, otherwise use value
        const optionUniqueKey = selectedOption?.uniqueKey;

        // Check if already selected (by uniqueKey or value)
        let alreadySelectedValue: string | undefined;
        if (optionUniqueKey) {
          // Find existing selection with same uniqueKey
          alreadySelectedValue = currentValues.find((v) => {
            const cachedOpt = allOptionsMap.get(v) || selectedOptionsCache.get(v);
            return cachedOpt?.uniqueKey === optionUniqueKey;
          });
        } else {
          // Fallback to value comparison
          alreadySelectedValue = currentValues.includes(optionValue) ? optionValue : undefined;
        }

        const isAlreadySelected = !!alreadySelectedValue;

        // Toggle: if already selected, remove it; otherwise add it
        const newValues = isAlreadySelected
          ? currentValues.filter((v) => v !== alreadySelectedValue)
          : [...currentValues, optionValue];
        onValueChange(newValues);
      } else {
        onValueChange(optionValue);
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    // Handle toggle
    const handleToggle = () => {
      if (disabled) return;

      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);

      if (newIsOpen) {
        // Calculate position immediately and after a small delay for accuracy
        calculateDropdownPosition();
        setTimeout(() => calculateDropdownPosition(), 10);
        // prepare animation
        setAnimateOpen(false);
        requestAnimationFrame(() => setAnimateOpen(true));

        // Load initial data when dropdown opens for server search (only if empty)
        if (searchType === "server" && onServerSearch && serverOptions.length === 0) {
          setIsSearching(true);
          onServerSearch("")
            .then((results: GenericSelectOption[]) => {
              // Deduplicate results by value
              const seen = new Set<string>();
              const unique = results.filter((r) => {
                if (seen.has(r.value)) return false;
                seen.add(r.value);
                return true;
              });
              setServerOptions(unique);
              setIsSearching(false);
            })
            .catch((error: any) => {
              appLogger.error("Failed to load server options:", error);
              setServerOptions([]);
              setIsSearching(false);
            });
        }
      }

      if (!newIsOpen) {
        setSearchQuery("");
        setAnimateOpen(false);
        // Return focus to trigger when closing
        requestAnimationFrame(() => {
          if (triggerRef.current) {
            try {
              triggerRef.current.focus();
            } catch {}
          }
        });
        // Don't reset server options when closing - keep them for next open
        // Only reset if we want to force a refresh on next open
      }
    };

    // Handle select all (multi-select only)
    const handleSelectAll = () => {
      if (!onValueChange || !isMultiSelect) return;
      const allValues = displayOptions.filter((opt) => !opt.disabled).map((opt) => opt.value);
      onValueChange(allValues);
    };

    // Handle clear all (multi-select only)
    const handleClearAll = () => {
      if (!onValueChange || !isMultiSelect) return;
      onValueChange([]);
    };

    // Generate display text with hierarchical breadcrumb for tree select
    const getDisplayText = () => {
      if (selectedOptions.length === 0) {
        return defaultPlaceholder;
      }

      if (!isMultiSelect) {
        const selectedOption = selectedOptions[0];
        if (!selectedOption) return defaultPlaceholder;

        // For tree select, show full hierarchical path with RTL support
        if (isTreeSelect) {
          const path = getNodePath(selectedOption.value, treeData || options);

          if (direction === "rtl") {
            const reversedPath = [...path].reverse();
            const selectedItem = reversedPath[0]; // Selected item (WE)
            const parentPath = reversedPath.slice(1); // Parent path (R2, R1, WH1)

            return (
              <div className="flex items-center gap-1 overflow-hidden text-sm">
                {parentPath.length > 0 && (
                  <>
                    <span className="truncate text-xs text-nx-ink-3">{parentPath.join(" ‹ ")}</span>

                    <span aria-hidden="true" className="flex-shrink-0 text-xs text-nx-ink-3">
                      ›
                    </span>
                  </>
                )}
                <span className="truncate font-medium">{selectedItem}</span>
              </div>
            );
          } else {
            return (
              <div className="flex items-center gap-1 overflow-hidden text-sm">
                <span className="truncate text-xs text-nx-ink-3">
                  {path.slice(0, -1).join(" › ")}
                </span>
                {path.length > 1 && (
                  <span aria-hidden="true" className="flex-shrink-0 text-xs text-nx-ink-3">
                    ›
                  </span>
                )}
                <span className="truncate font-medium">{path[path.length - 1]}</span>
              </div>
            );
          }
        }

        return selectedOption.label;
      }

      if (selectedOptions.length <= maxSelectedDisplay) {
        // For small selections, show truncated labels to prevent overflow
        const labels = selectedOptions.map((opt: GenericSelectOption) =>
          opt.label.length > 15 ? opt.label.substring(0, 15) + "..." : opt.label
        );
        return labels.join(", ");
      }

      // For large selections, show count with localized text
      return `${selectedOptions.length} ${defaultSelectedText}`;
    };

    // Click outside handler and window events for portal dropdown
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const isClickInTrigger = containerRef.current && containerRef.current.contains(target);
        const isClickInDropdown = dropdownRef.current && dropdownRef.current.contains(target);

        if (!isClickInTrigger && !isClickInDropdown) {
          setIsOpen(false);
          setSearchQuery("");
          // Don't reset server options when closing - keep them for next open
          // Only reset if we want to force a refresh on next open
        }
      };

      const handleWindowResize = () => {
        if (isOpen) {
          calculateDropdownPosition();
        }
      };

      const handleWindowScroll = (event: Event) => {
        if (isOpen && containerRef.current) {
          // Ignore scroll events from inside the dropdown itself
          if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
            return;
          }

          // Check if field is starting to hide (more sensitive detection)
          const rect = containerRef.current.getBoundingClientRect();
          const threshold = 10; // Close when field is 10px from edge
          const isFieldStartingToHide =
            rect.top < threshold ||
            rect.bottom > window.innerHeight - threshold ||
            rect.left < threshold ||
            rect.right > window.innerWidth - threshold;

          if (isFieldStartingToHide) {
            // Field is starting to hide, close dropdown
            setIsOpen(false);
            setSearchQuery("");
            // Don't reset server options when closing - keep them for next open
          } else {
            // Field is still fully visible, update position
            requestAnimationFrame(() => {
              calculateDropdownPosition();
            });
          }
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("resize", handleWindowResize);
        window.addEventListener("scroll", handleWindowScroll, true);

        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
          window.removeEventListener("resize", handleWindowResize);
          window.removeEventListener("scroll", handleWindowScroll, true);
        };
      }
    }, [isOpen, searchType, options, calculateDropdownPosition]);

    return (
      <div ref={containerRef} className="relative w-full" {...props}>
        <div
          ref={(node) => {
            triggerRef.current = node;
            // Forward ref to containerRef if provided
            if (ref) {
              if (typeof ref === "function") {
                ref(containerRef.current);
              } else {
                // Safe assignment for forwarded ref
                try {
                  (ref as any).current = containerRef.current;
                } catch {}
              }
            }
          }}
          // No "suppress the trigger's focus ring while the panel is open"
          // override any more: the ring is `focus-visible:shadow-nx-focus`, and
          // a searchable trigger drops to tabIndex -1 the moment it opens, so
          // it cannot be focus-visible while the search input holds focus.
          className={styles.trigger}
          onClick={handleToggle}
          onMouseDownCapture={(e) => {
            // Stop focus from landing on the trigger when using searchable selects
            if (isSearchable) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onMouseDown={(e) => {
            if (disabled) return;
            if (isSearchable) {
              // Prevent the default focus on the trigger and open/focus dropdown immediately
              e.preventDefault();
              const willOpen = !isOpen;
              if (willOpen) {
                setIsOpen(true);
                // Position and focus as soon as possible
                calculateDropdownPosition();
                requestAnimationFrame(() => {
                  try {
                    searchInputRef.current?.focus({ preventScroll: true });
                  } catch {}
                });
              } else {
                setIsOpen(false);
                requestAnimationFrame(() => {
                  try {
                    triggerRef.current?.focus();
                  } catch {}
                });
              }
            }
          }}
          // A combobox that only answers the mouse is a combobox half the
          // product cannot reach. Enter/Space open it, Escape closes it — the
          // same contract Radix gives every other overlay here.
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleToggle();
            } else if (event.key === "Escape" && isOpen) {
              event.preventDefault();
              setIsOpen(false);
              setSearchQuery("");
            }
          }}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : isOpen && isSearchable ? -1 : 0}
        >
          <div className="flex min-h-6 flex-1 flex-wrap items-center gap-1 overflow-hidden">
            {isMultiSelect && selectedOptions.length > 0 ? (
              selectedOptions.length <= maxSelectedDisplay ? (
                // Show individual chips for small selections
                selectedOptions.map((option: GenericSelectOption) => {
                  // For tree select, show hierarchical path with RTL support
                  let displayLabel = option.label;
                  if (isTreeSelect) {
                    const path = getNodePath(option.value, treeData || options);
                    if (direction === "rtl") {
                      // RTL: Show selected item on left, parents on right (WE ‹ R2 ‹ R1 ‹ WH1)
                      const reversedPath = [...path].reverse();
                      displayLabel = reversedPath.join(" ‹ ");
                    } else {
                      // LTR: Show parents on left, selected on right (WH1 › R1 › R2 › WE)
                      displayLabel = path.join(" › ");
                    }
                  }

                  return (
                    <ResponsiveChip
                      key={option.value}
                      label={displayLabel}
                      onRemove={() => {
                        if (!onValueChange) return;
                        onValueChange(currentValues.filter((v) => v !== option.value));
                      }}
                      className={styles.chip}
                    />
                  );
                })
              ) : (
                // Show summary text for large selections with responsive handling
                <span className="max-w-full truncate text-sm text-nx-ink-2">
                  {`${selectedOptions.length} ${defaultSelectedText}`}
                </span>
              )
            ) : (
              <span
                className={cn(
                  "max-w-full truncate text-sm",
                  // The placeholder is absent data, so it takes the hint ink;
                  // a real value takes body ink. Never one ink at two opacities.
                  selectedOptions.length === 0 ? "text-nx-ink-3" : "text-nx-ink"
                )}
              >
                {getDisplayText()}
              </span>
            )}
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            {allowClear && !disabled && selectedOptions.length > 0 && (
              <button
                type="button"
                aria-label={t("common.clearSelection")}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMultiSelect) {
                    handleClearAll();
                  } else {
                    onValueChange?.("");
                  }
                }}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-nx-ink-3",
                  "transition-[color,background-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                  "hover:bg-nx-hover hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none"
                )}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "h-4 w-4 flex-shrink-0 text-nx-ink-3",
                "transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </div>

        {isOpen &&
          portalRoot &&
          createPortal(
            <div
              ref={dropdownRef}
              data-dropdown-portal="true"
              data-searchable-select="true"
              className={cn(
                "pointer-events-auto fixed z-dropdown min-w-32 overflow-hidden",
                // A crossfade only. The panel used to also travel 6px and to
                // zero out two of its own corners so it looked welded to the
                // trigger — geometry the radius ladder does not contain, and
                // movement reduced motion could not switch off.
                "transition-opacity duration-nx-standard ease-nx-enter motion-reduce:transition-none",
                styles.panel
              )}
              onMouseDownCapture={(e) => {
                // Keep interactions inside dropdown from bubbling to document/trigger
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              onFocusCapture={(e) => e.stopPropagation()}
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                maxHeight: dropdownPosition.maxHeight,
                opacity: animateOpen ? 1 : 0,
              }}
            >
              {/* Search input for searchable types */}
              {isSearchable && (
                <div className="border-b border-nx-line p-2">
                  <div className="relative">
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
                    />
                    {showLoading && (
                      <span className="absolute end-3 top-1/2 -translate-y-1/2 text-nx-ink-3">
                        <LoadingSpinner size="inline" showText={false} />
                      </span>
                    )}
                    <Input
                      ref={searchInputRef}
                      type="text"
                      aria-label={t("select.searchLabel")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onMouseDownCapture={(e) => e.stopPropagation()}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        // Explicitly focus the input to defeat any focus traps
                        try {
                          (e.currentTarget as HTMLInputElement).focus();
                        } catch {}
                      }}
                      onPointerDownCapture={(e) => e.stopPropagation()}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        try {
                          (e.currentTarget as HTMLInputElement).focus();
                        } catch {}
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      onFocus={() => setIsOpen(true)}
                      autoComplete="off"
                      placeholder={defaultSearchPlaceholder}
                      // The glyph rails are logical, so the same two classes
                      // hold in both writing directions; `text-start` comes
                      // from the field surface itself.
                      className="pe-10 ps-10 text-start"
                      dir={direction}
                    />
                  </div>
                </div>
              )}

              {/* Multi-select batch operations */}
              {isMultiSelect && displayOptions.length > 0 && (
                <div className="flex items-center gap-2 border-b border-nx-line p-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={cn(
                      "rounded-nx-sm px-1 text-xs font-medium text-nx-accent",
                      "transition-[color,background-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                      "hover:bg-nx-hover focus-visible:shadow-nx-focus focus-visible:outline-none"
                    )}
                  >
                    {defaultSelectAllText}
                  </button>
                  <span aria-hidden="true" className="h-3 w-px bg-nx-line-hi" />
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className={cn(
                      "rounded-nx-sm px-1 text-xs font-medium text-nx-ink-2",
                      "transition-[color,background-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                      "hover:bg-nx-hover hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none"
                    )}
                  >
                    {defaultClearAllText}
                  </button>
                </div>
              )}

              {/* Options list with dynamic scrollable height */}
              <div
                id={listboxId}
                role="listbox"
                aria-label={t("select.optionsLabel")}
                aria-multiselectable={isMultiSelect || undefined}
                className="overflow-y-auto p-1"
                onWheel={(e) => {
                  // Prevent wheel events from propagating to the dialog,
                  // which would otherwise capture them and block scrolling.
                  e.stopPropagation();
                }}
                style={{
                  maxHeight: `calc(${dropdownPosition.maxHeight}px - ${
                    isSearchable ? "84px" : "40px"
                  })`,
                  overscrollBehavior: "contain",
                }}
              >
                {showLoading ? (
                  <div className="flex items-center justify-center gap-2 py-6">
                    <LoadingSpinner size="sm" showText={false} />
                    <span className="text-sm text-nx-ink-2">{defaultSearchingText}</span>
                  </div>
                ) : displayOptions.length === 0 ? (
                  <EmptyState bare size="sm" icon={SearchX} title={defaultNoResultsText} />
                ) : (
                  displayOptions.map((option) => {
                    // Check if selected - use uniqueKey if available for deduplication
                    const isSelected = option.uniqueKey
                      ? currentValues.some((v) => {
                          const cachedOpt = allOptionsMap.get(v) || selectedOptionsCache.get(v);
                          return cachedOpt?.uniqueKey === option.uniqueKey;
                        })
                      : currentValues.includes(option.value);
                    const hasChildren = option.children && option.children.length > 0;
                    const isExpanded = internalExpandedKeys.includes(option.value);
                    const level = option.level || 0;

                    return (
                      // One row skin for every depth. Tree levels used to be
                      // colour-coded (accent slab, info slab, muted slab), which
                      // spent three hues on information the indent already
                      // carries — and left level 3+ reading as an error state.
                      // Depth is now indentation and the disclosure glyph;
                      // colour is reserved for selection.
                      <div
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled || undefined}
                        tabIndex={-1}
                        onKeyDown={(event) => {
                          if (option.disabled) return;
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleSelect(option.value);
                          }
                        }}
                        className={cn(
                          SELECT_ITEM,
                          "my-0.5 cursor-pointer",
                          isSelected && SELECT_ITEM_SELECTED,
                          option.disabled && SELECT_ITEM_DISABLED
                        )}
                        style={{
                          // Logical, so the indent grows from the reading edge
                          // in Arabic instead of piling up on the wrong side.
                          paddingInlineStart: isTreeSelect ? `${12 + level * 20}px` : undefined,
                          marginInlineStart: isTreeSelect ? `${level * 4}px` : undefined,
                        }}
                      >
                        {/* Tree expand/collapse control */}
                        {isTreeSelect && (
                          <button
                            type="button"
                            aria-label={t(
                              isExpanded ? "select.collapseGroup" : "select.expandGroup",
                              { label: option.label }
                            )}
                            aria-expanded={hasChildren ? isExpanded : undefined}
                            disabled={!hasChildren}
                            className={cn(
                              "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-nx-ink-3",
                              "transition-[color,background-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                              "hover:bg-nx-hover hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none",
                              "disabled:pointer-events-none disabled:invisible"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(option.value);
                            }}
                          >
                            <ChevronRight
                              aria-hidden="true"
                              className={cn(
                                "h-4 w-4",
                                "transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                                // Collapsed points along the reading direction;
                                // expanded points down in both directions.
                                isExpanded ? "rotate-90" : "rtl:rotate-180"
                              )}
                            />
                          </button>
                        )}

                        {/* Option content */}
                        <div
                          className="flex min-w-0 flex-1 items-center gap-2"
                          onClick={() => !option.disabled && handleSelect(option.value)}
                        >
                          {option.icon && (
                            <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                              {option.icon}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div
                              className={cn(
                                isTreeSelect && level === 0 ? "font-semibold" : "font-medium"
                              )}
                            >
                              {option.label}
                            </div>
                            {option.description && (
                              <div className="mt-0.5 text-xs text-nx-ink-3">
                                {option.description}
                              </div>
                            )}
                            {/* Show breadcrumb path for tree items on hover with RTL support */}
                            {isTreeSelect && level > 0 && (
                              <div className="mt-1 text-xs text-nx-ink-3 opacity-0 transition-opacity duration-nx-micro ease-nx-enter group-hover:opacity-100 motion-reduce:transition-none">
                                {direction === "rtl"
                                  ? getNodePath(option.value, treeData || options)
                                      .reverse()
                                      .join(" ‹ ")
                                  : getNodePath(option.value, treeData || options).join(" › ")}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <Check
                              aria-hidden="true"
                              className="h-4 w-4 flex-shrink-0 text-nx-accent"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>,
            portalRoot
          )}
        {/* After the dropdown is rendered, measure its actual height and snap it right above/below the trigger */}
        {isOpen && (
          <RenderMeasure
            onMeasure={() => {
              if (!containerRef.current || !dropdownRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              const dh = dropdownRef.current.offsetHeight;
              const top = shouldShowAboveRef.current ? rect.top - dh - 1 : rect.bottom + 1;
              setDropdownPosition((pos) => ({ ...pos, top: Math.max(top, 1) }));
            }}
          />
        )}
      </div>
    );
  }
);

GenericSelect.displayName = "GenericSelect";

export default GenericSelect;

// Helper to run a layout effect after portal render
function RenderMeasure({ onMeasure }: { onMeasure: () => void }) {
  React.useLayoutEffect(() => {
    // Use rAF to ensure DOM painted
    const id = requestAnimationFrame(() => onMeasure());
    return () => cancelAnimationFrame(id);
  }, [onMeasure]);
  return null;
}
