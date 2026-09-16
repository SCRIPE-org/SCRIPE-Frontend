"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Popover } from "@core/ui/popover";
import { SelectTrigger } from "./select/select-trigger";
import { SelectPanel } from "./select/select-panel";
import { useSelectOptions } from "./select/use-select-options";

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

  // ── Additive, all optional ────────────────────────────────────────────────
  /** Lands on the role="combobox" element so <Label htmlFor> binds to it. */
  id?: string;
  name?: string;
  /** Draws the danger edge and sets aria-invalid. */
  invalid?: boolean;
  /** Readable value, no picker, no grey slab. NOT the same as `disabled`. */
  readOnly?: boolean;
  required?: boolean;
  describedBy?: string;
  /** Renders the error state inside the panel, with a retry when paired. */
  error?: string | null;
  onRetry?: () => void;
  /** "nothing exists yet" — distinct from "your search matched nothing". */
  emptyText?: string;
  /**
   * Accessible name for the trigger's role="combobox" element. Required
   * because that element is a `<div>`, not a labelable HTML element (button/
   * input/select/textarea/...) — a sibling `<label htmlFor>` pointing at its
   * `id` computes NO accessible name for it (HTML restricts `for`
   * association to the labelable-element set; per ARIA, role="combobox" is
   * Name From: author, not Name From: contents). Wave 2 Step 2.2's Task 4
   * review (finding T1) traced this precisely: 5 of the module's 8
   * custom-field consumer sites already relied on `<Label htmlFor>` +
   * `<GenericSelect id>` and got NO accessible name from it even before that
   * task; the other 3 sites' pre-conversion raw Radix `Select` rendered a
   * native, labelable `<button>` and DID get one, so converting them onto
   * this component (Task 7b) would have silently regressed their working
   * accessible name without this prop. Prefer `aria-labelledby` when a real
   * on-screen label element with its own `id` already exists; use
   * `aria-label` otherwise.
   */
  "aria-label"?: string;
  /** See `aria-label`'s doc comment above; points at an existing label element's `id` instead of duplicating its text. */
  "aria-labelledby"?: string;

  // Additional props
  [key: string]: any;
}

/**
 * The one select in the product: single, searchable, multi and tree.
 *
 * This is a facade. Positioning, portalling, outside-click, scroll tracking,
 * focus transfer and open/close motion are Popover's and cmdk's jobs — the
 * previous implementation hand-rolled all of them across 1369 lines, which is
 * where the invisible-but-clickable panel, the 60fps measurement loop and the
 * five-timer focus storm came from.
 *
 * The public API and its behavioural contracts are unchanged. Notably:
 * an array `value` implies multi even when `type="single"`; clearing emits
 * `""` for single and `[]` for multi; Select-All takes only the currently
 * displayed options; `uniqueKey` overrides `value` for selection comparison;
 * and selecting never remounts, because a remount would close the panel.
 */
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
      // Accepted for call-site compatibility; server search goes through
      // onServerSearch, which is the only path that ever existed.
      searchEndpoint: _searchEndpoint,
      debounceMs = 300,
      noResultsText,
      // The panel announces its own progress; kept so callers keep compiling.
      searchingText: _searchingText,
      maxSelectedDisplay = 3,
      selectAllText,
      clearAllText,
      // Retained for API compatibility — the "+N" affordance replaced the
      // "N Selected" cliff that used this string.
      selectedText: _selectedText,
      allowClear = true,
      loading = false,
      treeData,
      onTreeDataLoad,
      expandedKeys,
      onExpandedKeysChange,
      // Accepted and ignored, as before. Do not remove the key: dropping it
      // breaks callers compiled with exactOptionalPropertyTypes.
      showFullPath: _showFullPath = false,
      id,
      name,
      invalid,
      readOnly = false,
      required,
      describedBy,
      error = null,
      onRetry,
      emptyText,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    },
    ref
  ) => {
    const { t } = useI18n();

    const [isOpen, setIsOpen] = React.useState(false);
    const [internalExpandedKeys, setInternalExpandedKeys] = React.useState<string[]>(
      expandedKeys ?? []
    );

    // An array value means multi regardless of `type` — several call sites rely
    // on passing string[] to a select they never re-typed.
    const isMultiSelect = type === "multi" || Array.isArray(value);
    const isTreeSelect = type === "tree";
    const isSearchable = type === "searchable" || searchable || isMultiSelect || isTreeSelect;

    const activeExpandedKeys = expandedKeys ?? internalExpandedKeys;

    const {
      query,
      setQuery,
      resetQuery,
      currentValues,
      selectedOptions,
      displayOptions,
      allOptionsMap,
      isSearching,
      searchError,
      retrySearch,
      rememberOption,
      findSelectedMatch,
      isOptionSelected,
      effectiveExpandedKeys,
      pathLabelFor,
    } = useSelectOptions({
      options,
      value,
      isTreeSelect,
      searchType,
      onServerSearch,
      debounceMs,
      treeData,
      onTreeDataLoad,
      expandedKeys: activeExpandedKeys,
      isOpen,
    });

    const resolvedPlaceholder =
      placeholder ??
      (isMultiSelect ? t("components.multiSelect.placeholder") : t("components.select.placeholder"));
    const resolvedSearchPlaceholder =
      searchPlaceholder ??
      (isMultiSelect
        ? t("components.multiSelect.searchPlaceholder")
        : t("components.searchableSelect.placeholder"));
    const resolvedNoResults = noResultsText ?? t("components.multiSelect.searchStates.noResults");
    const resolvedSelectAll = selectAllText ?? t("components.multiSelect.buttons.selectAll");
    const resolvedClearAll = clearAllText ?? t("components.multiSelect.buttons.clearAll");

    const handleOpenChange = (open: boolean) => {
      if (disabled || readOnly) return;
      setIsOpen(open);
      if (!open) resetQuery();
    };

    const handleSelect = (option: GenericSelectOption) => {
      if (!onValueChange) return;
      rememberOption(allOptionsMap.get(option.value) ?? option);

      if (isMultiSelect) {
        const alreadySelected = findSelectedMatch(option);
        const next =
          alreadySelected !== undefined
            ? currentValues.filter((val) => val !== alreadySelected)
            : [...currentValues, option.value];
        onValueChange(next);
        return;
      }

      onValueChange(option.value);
      setIsOpen(false);
      resetQuery();
    };

    const handleRemoveOne = (option: GenericSelectOption) => {
      if (!onValueChange) return;
      const match = findSelectedMatch(option) ?? option.value;
      onValueChange(currentValues.filter((val) => val !== match));
    };

    const handleClear = () => {
      if (!onValueChange) return;
      // Single clears to "", multi clears to []. Callers branch on the runtime
      // type, so emitting undefined/null here would break them.
      onValueChange(isMultiSelect ? [] : "");
    };

    const handleSelectAll = () => {
      if (!onValueChange || !isMultiSelect) return;
      // Currently DISPLAYED options only — with a query active this is the
      // filtered set, which is the long-standing behaviour.
      onValueChange(displayOptions.filter((option) => !option.disabled).map((o) => o.value));
    };

    const handleToggleExpanded = (nodeValue: string) => {
      // Toggle against what is ACTUALLY open, which includes the ancestors
      // auto-opened to reveal the current selection — otherwise collapsing one
      // of those does nothing, because it was never in the caller's list.
      const next = effectiveExpandedKeys.includes(nodeValue)
        ? effectiveExpandedKeys.filter((key: string) => key !== nodeValue)
        : [...effectiveExpandedKeys, nodeValue];
      setInternalExpandedKeys(next);
      onExpandedKeysChange?.(next);
    };

    const panelError = error ?? searchError;

    return (
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <SelectTrigger
          ref={ref}
          id={id}
          name={name}
          open={isOpen}
          multi={isMultiSelect}
          disabled={disabled}
          readOnly={readOnly}
          invalid={invalid}
          required={required}
          describedBy={describedBy}
          ariaLabel={ariaLabel}
          ariaLabelledBy={ariaLabelledBy}
          placeholder={resolvedPlaceholder}
          selectedOptions={selectedOptions}
          // Tree values show their full path — two sibling nodes under
          // different parents are otherwise identical in the closed field.
          displayLabel={selectedOptions[0] ? pathLabelFor(selectedOptions[0]) : ""}
          maxSelectedDisplay={maxSelectedDisplay}
          allowClear={allowClear}
          onClear={handleClear}
          onRemoveOne={handleRemoveOne}
          className={className}
          wrapperProps={rest}
        />
        <SelectPanel
          options={displayOptions}
          multi={isMultiSelect}
          tree={isTreeSelect}
          searchable={isSearchable}
          searchPlaceholder={resolvedSearchPlaceholder}
          query={query}
          onQueryChange={setQuery}
          loading={loading || isSearching}
          error={panelError}
          onRetry={onRetry ?? (searchError ? retrySearch : undefined)}
          emptyText={emptyText}
          noResultsText={resolvedNoResults}
          isSelected={isOptionSelected}
          onSelect={handleSelect}
          expandedKeys={effectiveExpandedKeys}
          onToggleExpanded={handleToggleExpanded}
          onSelectAll={handleSelectAll}
          onClearAll={handleClear}
          selectAllText={resolvedSelectAll}
          clearAllText={resolvedClearAll}
          selectedCount={currentValues.length}
        />
      </Popover>
    );
  }
);

GenericSelect.displayName = "GenericSelect";

export default GenericSelect;
