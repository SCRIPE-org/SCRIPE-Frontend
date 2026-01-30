/**
 * Dropdown Manager Hook
 * 
 * Generic hook for managing dropdown state in view models.
 * Handles preloading, searching, and maintaining current selection.
 * Used by view models that need dropdown functionality.
 */

import { useState, useEffect, useCallback, useMemo } from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface UseDropdownManagerOptions<TItem> {
  /**
   * Service method to fetch items for dropdown
   */
  fetchItems: (params: { page?: number; pageSize?: number; PageSearch?: string }) => Promise<{ data: TItem[] }>;
  
  /**
   * Function to get the ID from an item
   */
  getId: (item: TItem) => string;
  
  /**
   * Function to get the label from an item
   */
  getLabel: (item: TItem) => string;
  
  /**
   * ID of the currently selected item (for edit mode)
   */
  selectedId?: string | null;
  
  /**
   * Method to fetch a single item by ID (for loading current selection)
   */
  fetchItemById?: (id: string) => Promise<TItem>;
  
  /**
   * Initial page size for loading items
   */
  initialPageSize?: number;
}

/**
 * Hook to manage dropdown state and operations
 */
export function useDropdownManager<TItem>({
  fetchItems,
  getId,
  getLabel,
  selectedId,
  fetchItemById,
  initialPageSize = 50,
}: UseDropdownManagerOptions<TItem>) {
  const [preloadedOptions, setPreloadedOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentOption, setCurrentOption] = useState<DropdownOption | null>(null);

  // Load initial options
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const response = await fetchItems({
          page: 1,
          pageSize: initialPageSize,
        });
        const options = response.data.map((item) => ({
          value: getId(item),
          label: getLabel(item),
        }));
        setPreloadedOptions(options);
      } catch (error) {
        // Silently fail - user will see error when trying to use dropdown
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [fetchItems, getId, getLabel, initialPageSize]);

  // Update current option when selectedId changes (for edit mode)
  useEffect(() => {
    if (!selectedId) {
      setCurrentOption(null);
      return;
    }

    // First check if it's in preloaded options
    const existingOption = preloadedOptions.find((opt) => opt.value === selectedId);
    if (existingOption) {
      setCurrentOption(existingOption);
      return;
    }

    // If not in preloaded and we have fetchItemById, fetch it
    if (fetchItemById) {
      fetchItemById(selectedId)
        .then((item) => {
          const option = {
            value: getId(item),
            label: getLabel(item),
          };
          setCurrentOption(option);
          // Add to preloaded options if not already there
          setPreloadedOptions((prev) => {
            if (!prev.find((opt) => opt.value === option.value)) {
              return [...prev, option];
            }
            return prev;
          });
        })
        .catch(() => {
          setCurrentOption(null);
        });
    } else {
      setCurrentOption(null);
    }
  }, [selectedId, preloadedOptions, fetchItemById, getId, getLabel]);

  // Server-side search function
  const search = useCallback(
    async (searchTerm: string): Promise<DropdownOption[]> => {
      try {
        const response = await fetchItems({
          page: 1,
          pageSize: initialPageSize,
          PageSearch: searchTerm,
        });
        const options = response.data.map((item) => ({
          value: getId(item),
          label: getLabel(item),
        }));

        // If current option exists and not in results, add it
        if (currentOption && !options.find((opt) => opt.value === currentOption.value)) {
          options.unshift(currentOption);
        }

        return options;
      } catch (error) {
        return [];
      }
    },
    [fetchItems, getId, getLabel, initialPageSize, currentOption]
  );

  // Get edit options (includes current option if not in preloaded)
  const editOptions = useMemo(() => {
    const options = [...preloadedOptions];
    if (currentOption && !options.find((opt) => opt.value === currentOption.value)) {
      options.unshift(currentOption);
    }
    return options;
  }, [preloadedOptions, currentOption]);

  return {
    preloadedOptions,
    editOptions,
    loading,
    currentOption,
    search,
  };
}

