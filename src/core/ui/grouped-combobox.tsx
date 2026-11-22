"use client";

import * as React from "react";
import { AlertTriangle, Check, ChevronsUpDown, SearchX } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { Button } from "@core/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@core/ui/command";
import { EmptyState } from "@core/ui/empty-state";
import { fieldVariants, resolveFieldStyle } from "@core/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { Skeleton } from "@core/ui/skeleton";

export interface GroupedComboboxOption {
  value: string;
  label: string;
  groupKey: string;
  groupLabel: string;
  displayPrefix?: string;
  pathSegments?: string[];
  route?: string | null;
  isUnavailable?: boolean;
  disabled?: boolean;
  keywords?: string[];
}

export interface GroupedComboboxProps {
  id?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: GroupedComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "data-testid"?: string;
  className?: string;
}

interface OptionGroupBucket {
  groupKey: string;
  groupLabel: string;
  options: GroupedComboboxOption[];
}

function renderBdiPathSegments(segments: string[]): React.ReactNode {
  return segments.map((segment, index) => (
    <React.Fragment key={`${index}-${segment}`}>
      {index > 0 && (
        <span aria-hidden="true" className="text-nx-ink-3">
          {" / "}
        </span>
      )}
      <bdi>{segment}</bdi>
    </React.Fragment>
  ));
}

function matchesSearch(option: GroupedComboboxOption, needle: string): boolean {
  if (!needle) return true;
  if (option.label.toLowerCase().includes(needle)) return true;
  if (option.groupLabel.toLowerCase().includes(needle)) return true;
  if (option.value.toLowerCase().includes(needle)) return true;
  if (option.route && option.route.toLowerCase().includes(needle)) return true;
  if (option.pathSegments?.some((seg) => seg.toLowerCase().includes(needle))) return true;
  if (option.keywords?.some((kw) => kw.toLowerCase().includes(needle))) return true;
  return false;
}

function groupOptions(options: GroupedComboboxOption[], query: string): OptionGroupBucket[] {
  const needle = query.trim().toLowerCase();
  const buckets = new Map<string, OptionGroupBucket>();

  for (const option of options) {
    if (!matchesSearch(option, needle)) continue;
    const key = option.groupKey || "default";
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        groupKey: key,
        groupLabel: option.groupLabel || key,
        options: [],
      };
      buckets.set(key, bucket);
    }
    bucket.options.push(option);
  }

  return Array.from(buckets.values());
}

/**
 * Accessible, RTL-safe grouped searchable combobox built strictly on `@core/ui/*` primitives.
 * Preserves mixed-script directional integrity by wrapping workspace & breadcrumb segments in `<bdi>`.
 */
export function GroupedCombobox({
  id,
  value = "",
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  loading = false,
  disabled = false,
  invalid = false,
  describedBy,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "data-testid": dataTestId,
  className,
}: GroupedComboboxProps) {
  const { t, direction } = useI18n();
  const settings = useSettings();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listboxId = React.useId();

  const resolvedPlaceholder =
    placeholder ?? t("components.select.placeholder", { defaultValue: "Select..." });
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t("select.searchLabel", { defaultValue: "Search options..." });
  const resolvedEmptyText =
    emptyText ?? t("common.noResultsFound", { defaultValue: "No results found" });

  const normalizedValue = value.trim().toLowerCase();
  const selectedOption = options.find((opt) => opt.value.toLowerCase() === normalizedValue);
  const groupedBuckets = groupOptions(options, query);
  const hasQuery = query.trim().length > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
    }
  };

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          ref={triggerRef}
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          data-testid={dataTestId}
          disabled={disabled}
          onKeyDown={(event) => {
            if (!disabled && !open && event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
            }
          }}
          className={cn(
            fieldVariants({ inputStyle: resolveFieldStyle(settings.inputStyle) }),
            "flex h-10 w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm font-normal hover:bg-nx-surface hover:text-nx-ink",
            open && "border-nx-accent shadow-nx-focus",
            disabled && "border-nx-line bg-nx-raised text-nx-ink-3 shadow-none",
            className
          )}
        >
          {!selectedOption ? (
            <span className="min-w-0 flex-1 truncate text-nx-ink-3">{resolvedPlaceholder}</span>
          ) : selectedOption.isUnavailable ? (
            <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-warning">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <bdi className="truncate">{selectedOption.label}</bdi>
            </span>
          ) : selectedOption.pathSegments && selectedOption.pathSegments.length > 0 ? (
            <span
              className="min-w-0 flex-1 truncate text-nx-ink"
              title={selectedOption.label}
            >
              {selectedOption.displayPrefix ? (
                <span className="text-nx-ink-2">{selectedOption.displayPrefix} </span>
              ) : null}
              {renderBdiPathSegments(selectedOption.pathSegments)}
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate text-nx-ink" title={selectedOption.label}>
              <bdi>{selectedOption.label}</bdi>
            </span>
          )}
          <ChevronsUpDown
            className="h-4 w-4 shrink-0 text-nx-ink-3"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        dir={direction}
        align="start"
        data-searchable-select=""
        className="w-[var(--radix-popover-trigger-width)] min-w-[280px] bg-nx-popover p-0 opacity-100 !animate-none"
      >
        <Command
          label={ariaLabel ?? t("select.optionsLabel", { defaultValue: "Options" })}
          shouldFilter={false}
        >
          <CommandInput
            aria-label={t("select.searchLabel", { defaultValue: "Search options" })}
            placeholder={resolvedSearchPlaceholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList id={listboxId} className="max-h-64">
            {loading && (
              <div className="space-y-1 p-1.5" aria-hidden="true">
                <Skeleton className="h-7 w-full rounded-nx-sm" />
                <Skeleton className="h-7 w-full rounded-nx-sm" />
              </div>
            )}

            {!loading && groupedBuckets.length === 0 ? (
              <output className="block px-3 py-6 text-center">
                <EmptyState
                  bare
                  size="sm"
                  icon={SearchX}
                  title={resolvedEmptyText}
                  description={hasQuery ? query : undefined}
                />
              </output>
            ) : (
              groupedBuckets.map((bucket) => (
                <CommandGroup
                  key={bucket.groupKey}
                  heading={<bdi>{bucket.groupLabel}</bdi>}
                >
                  {bucket.options.map((option) => {
                    const isSelected = option.value.toLowerCase() === normalizedValue;
                    const rowSegments =
                      option.pathSegments &&
                      option.pathSegments.length > 1 &&
                      option.pathSegments[0] === bucket.groupLabel
                        ? option.pathSegments.slice(1)
                        : option.pathSegments;

                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        onSelect={() => {
                          if (option.disabled) return;
                          handleSelect(option.value);
                        }}
                        className="relative flex items-center gap-2 ps-7 pe-2"
                      >
                        <span className="absolute start-2 flex h-4 w-4 items-center justify-center">
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />
                          )}
                        </span>

                        {option.isUnavailable ? (
                          <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-warning">
                            <AlertTriangle
                              className="h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            <bdi className="truncate">{option.label}</bdi>
                          </span>
                        ) : rowSegments && rowSegments.length > 0 ? (
                          <span className="min-w-0 flex-1 truncate" title={option.label}>
                            {option.displayPrefix ? (
                              <span className="text-nx-ink-2">{option.displayPrefix} </span>
                            ) : null}
                            {renderBdiPathSegments(rowSegments)}
                          </span>
                        ) : (
                          <span className="min-w-0 flex-1 truncate" title={option.label}>
                            {option.label}
                          </span>
                        )}

                        {option.route && option.pathSegments && option.pathSegments.length > 1 && (
                          <span
                            aria-hidden="true"
                            className="ms-auto max-w-[40%] shrink-0 truncate font-mono text-[11px] text-nx-ink-3"
                          >
                            <bdi dir="ltr">{option.route}</bdi>
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
