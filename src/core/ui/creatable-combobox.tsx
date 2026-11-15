/**
 * CreatableCombobox — Searchable Combobox with Free-Text Custom Entry
 *
 * Built on @core/ui/popover, @core/ui/command, and @core/ui/button.
 * Allows instant autocomplete from a curated list while empowering users to
 * type and register any custom unlisted entry (e.g. "Hadayek El Maadi")
 * without being blocked.
 *
 * @module core/ui/creatable-combobox
 */
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@core/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface CreatableComboboxProps {
  id?: string;
  options: (string | ComboboxOption)[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  createLabel?: (query: string) => string;
  allowCreate?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

export function CreatableCombobox({
  id,
  options,
  value = "",
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  createLabel,
  allowCreate = true,
  allowClear = true,
  disabled = false,
  className,
  "aria-invalid": ariaInvalid,
}: CreatableComboboxProps) {
  const { t, direction } = useI18n();
  const isRTL = direction === "rtl";
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listboxId = React.useId();

  const resolvedPlaceholder =
    placeholder ??
    t("components.creatableCombobox.placeholder", { defaultValue: "Select or type..." });
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t("common.search", { defaultValue: "Search..." });
  const resolvedEmptyText =
    emptyText ?? t("common.noResultsFound", { defaultValue: "No matching options" });
  const clearLabel = t("common.clearSelection", { defaultValue: "Clear selection" });
  const customHeading = t("components.creatableCombobox.customEntry", {
    defaultValue: "Custom entry",
  });
  const formatCreateLabel =
    createLabel ??
    ((q: string) =>
      t("components.creatableCombobox.createOption", {
        defaultValue: 'Use "{value}"',
        value: q,
      }));

  // Normalize options to ComboboxOption shape
  const normalizedOptions = React.useMemo<ComboboxOption[]>(() => {
    return options.map((opt) => (typeof opt === "string" ? { value: opt, label: opt } : opt));
  }, [options]);

  // Selected item display label
  const selectedLabel = React.useMemo(() => {
    if (!value) return "";
    const matched = normalizedOptions.find((o) => o.value.toLowerCase() === value.toLowerCase());
    return matched ? matched.label : value;
  }, [value, normalizedOptions]);

  // Check if query exactly matches any existing option
  const exactMatch = React.useMemo(() => {
    if (!query.trim()) return true;
    return normalizedOptions.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());
  }, [query, normalizedOptions]);

  const handleSelect = React.useCallback(
    (selectedValue: string) => {
      onChange(selectedValue);
      setOpen(false);
      setQuery("");
      triggerRef.current?.focus();
    },
    [onChange]
  );

  const handleClear = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onChange("");
      setQuery("");
      triggerRef.current?.focus();
    },
    [onChange]
  );

  const hasClear = Boolean(allowClear && value && !disabled);
  const isInvalid = ariaInvalid === true || ariaInvalid === "true";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative flex w-full items-center" dir={direction}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-invalid={ariaInvalid}
            disabled={disabled}
            variant="outline"
            className={cn(
              "h-9 w-full justify-between rounded-nx-control border border-nx-line-hi bg-nx-ground px-3 text-start text-xs font-normal text-nx-ink hover:border-nx-ink-3 hover:bg-nx-ground hover:text-nx-ink focus-visible:border-nx-accent focus-visible:shadow-nx-focus disabled:cursor-not-allowed disabled:border-nx-line disabled:bg-nx-raised disabled:text-nx-ink-3",
              !value && "text-nx-ink-3",
              isInvalid &&
                !disabled &&
                "border-nx-danger hover:border-nx-danger focus-visible:border-nx-danger focus-visible:shadow-[inset_0_0_0_1px_var(--nx-danger),0_0_0_3px_color-mix(in_srgb,var(--nx-danger)_18%,transparent)]",
              className
            )}
          >
            <span className={cn("truncate", hasClear && "pe-7")}>
              {selectedLabel || resolvedPlaceholder}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        {hasClear && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            aria-label={clearLabel}
            title={clearLabel}
            className="absolute end-8 top-1/2 z-raised h-6 w-6 -translate-y-1/2 rounded-full p-0 text-nx-ink-3 hover:bg-nx-raised hover:text-nx-ink"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </Button>
        )}
      </div>
      <PopoverContent
        dir={direction}
        className="w-[--radix-popover-trigger-width] min-w-[240px] p-0"
        align={isRTL ? "end" : "start"}
      >
        <Command
          filter={(itemValue, search) => {
            if (itemValue.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder={resolvedSearchPlaceholder}
            value={query}
            onValueChange={setQuery}
            className="h-9 text-xs"
          />
          <CommandList id={listboxId} className="max-h-56">
            <CommandEmpty className="py-2.5 text-center text-xs text-nx-ink-3">
              {resolvedEmptyText}
            </CommandEmpty>

            {/* Creatable custom entry if query not empty and not in list */}
            {allowCreate && query.trim().length > 0 && !exactMatch && (
              <CommandGroup heading={customHeading}>
                <CommandItem
                  value={query.trim()}
                  onSelect={() => handleSelect(query.trim())}
                  className="flex cursor-pointer items-center gap-2 text-xs font-medium text-nx-accent hover:bg-nx-accent-wash"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{formatCreateLabel(query.trim())}</span>
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup>
              {normalizedOptions.map((option) => {
                const isSelected = value.toLowerCase() === option.value.toLowerCase();
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className="flex cursor-pointer items-center justify-between text-xs"
                  >
                    <div className="flex flex-col truncate">
                      <span className="truncate">{option.label}</span>
                      {option.sublabel && (
                        <span className="text-[10px] text-nx-ink-3">{option.sublabel}</span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-nx-accent",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                      aria-hidden="true"
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
