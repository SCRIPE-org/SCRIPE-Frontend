"use client";

import * as React from "react";
import { Inbox, SearchX } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { PopoverContent } from "@core/ui/popover";
import { Command, CommandInput, CommandList } from "@core/ui/command";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { Button } from "@core/ui/button";
import { SelectOptionRow } from "./select-option-row";
import type { GenericSelectOption } from "../generic-select";

export interface SelectPanelProps {
  options: GenericSelectOption[];
  multi: boolean;
  tree: boolean;
  searchable: boolean;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  emptyText?: string;
  noResultsText: string;
  isSelected: (option: GenericSelectOption) => boolean;
  onSelect: (option: GenericSelectOption) => void;
  expandedKeys: string[];
  onToggleExpanded?: (value: string) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
  selectAllText: string;
  clearAllText: string;
  selectedCount: number;
}

/**
 * The floating half of the select.
 *
 * Built on PopoverContent + cmdk, which is what replaced ~900 lines of
 * hand-rolled popper maths: portal ownership, direction, collision padding,
 * available-height capping, scroll containment, open/close motion and keyboard
 * navigation are all the primitives' jobs now.
 *
 * The panel models five states as five distinct things. Previously "still
 * loading", "nothing exists yet", "your search matched nothing" and "the
 * request failed" all rendered the same "No Results" node, so a 500 was
 * indistinguishable from an empty table and offered no way to retry.
 */
export function SelectPanel({
  options,
  multi,
  tree,
  searchable,
  searchPlaceholder,
  query,
  onQueryChange,
  loading,
  error,
  onRetry,
  emptyText,
  noResultsText,
  isSelected,
  onSelect,
  expandedKeys,
  onToggleExpanded,
  onSelectAll,
  onClearAll,
  selectAllText,
  clearAllText,
  selectedCount,
}: SelectPanelProps) {
  const { t } = useI18n();
  const hasQuery = query.trim().length > 0;

  const body = (() => {
    if (error) {
      return (
        <div className="p-2">
          <ErrorMessage message={error} onRetry={onRetry} size="sm" />
        </div>
      );
    }

    if (loading) {
      // A skeleton in the shape of the rows it replaces, not a spinner — the
      // panel keeps its height and the list does not jump when results land.
      return (
        <div className="space-y-1 p-1" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full rounded-nx-sm" />
          ))}
        </div>
      );
    }

    if (options.length === 0) {
      return hasQuery ? (
        <EmptyState bare size="sm" icon={SearchX} title={noResultsText} description={query} />
      ) : (
        <EmptyState bare size="sm" icon={Inbox} title={emptyText ?? noResultsText} />
      );
    }

    return options.map((option) => (
      <SelectOptionRow
        key={option.uniqueKey ?? option.value}
        option={option}
        selected={isSelected(option)}
        multi={multi}
        expandable={tree && !!option.children?.length}
        expanded={expandedKeys.includes(option.value)}
        indent={tree}
        onToggleExpanded={onToggleExpanded}
        onSelect={onSelect}
      />
    ));
  })();

  return (
    <PopoverContent
      align="start"
      // Match the field so the panel reads as an extension of it. The trigger
      // IS the field (see select-trigger.tsx), so this variable measures the
      // whole control rather than a button inside it.
      className="w-[var(--radix-popover-trigger-width)] min-w-48 p-0"
    >
      {/*
        `label` names the listbox. cmdk defaults it to the hardcoded English
        string "Suggestions", which every Arabic user would have heard.

        `shouldFilter={false}` always: useSelectOptions already filters on label
        AND description. Letting cmdk filter again scored rows against
        "label value" — no description — so searching for a word that appears
        only in a description produced a panel with rows filtered out by cmdk,
        no empty message (our option list was non-empty), and a live region
        cheerfully announcing N results over the void.
      */}
      <Command label={t("select.optionsLabel")} shouldFilter={false}>
        {/*
          The search row is ALWAYS mounted, and merely visually hidden when the
          select is not searchable.

          cmdk's whole keyboard engine — arrows, Home/End, Enter — is one
          onKeyDown on its root, which only sees events that bubble through its
          subtree. A non-searchable panel had nothing focusable inside it, so
          focus stayed on the trigger, no key ever reached cmdk, and roughly
          forty single-selects across the app could not be operated by keyboard
          at all. Keeping a focusable (sr-only) input inside Command restores
          the entire keymap. It is not wired to the query in that mode, so
          typing cannot silently filter a list with no visible search box.
        */}
        <div className={cn(!searchable && "sr-only")}>
          <CommandInput
            aria-label={t("select.searchLabel")}
            placeholder={searchPlaceholder}
            {...(searchable ? { value: query, onValueChange: onQueryChange } : {})}
          />
        </div>

        {/* Announced, not just drawn: a screen-reader user searching a list
            gets no feedback at all from a silently re-rendered result set. */}
        <span className="sr-only" aria-live="polite">
          {loading
            ? t("common.loading")
            : t("components.select.optionsAvailable", { count: options.length })}
        </span>

        <CommandList aria-multiselectable={multi || undefined}>{body}</CommandList>

        {multi && options.length > 0 && (
          <div className="flex items-center justify-between gap-2 border-t border-nx-line p-1">
            <Button type="button" variant="ghost" size="sm" onClick={onSelectAll}>
              {selectAllText}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              disabled={selectedCount === 0}
              className={cn(selectedCount === 0 && "invisible")}
            >
              {clearAllText}
            </Button>
          </div>
        )}
      </Command>
    </PopoverContent>
  );
}
