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
  placeholder = "Select or type...",
  searchPlaceholder = "Search...",
  emptyText = "No matching options",
  createLabel = (q) => `Use "${q}"`,
  allowCreate = true,
  allowClear = true,
  disabled = false,
  className,
  "aria-invalid": ariaInvalid,
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  // Normalize options to ComboboxOption shape
  const normalizedOptions = React.useMemo<ComboboxOption[]>(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt
    );
  }, [options]);

  // Selected item display label
  const selectedLabel = React.useMemo(() => {
    if (!value) return "";
    const matched = normalizedOptions.find(
      (o) => o.value.toLowerCase() === value.toLowerCase()
    );
    return matched ? matched.label : value;
  }, [value, normalizedOptions]);

  // Check if query exactly matches any existing option
  const exactMatch = React.useMemo(() => {
    if (!query.trim()) return true;
    return normalizedOptions.some(
      (o) => o.label.toLowerCase() === query.trim().toLowerCase()
    );
  }, [query, normalizedOptions]);

  const handleSelect = React.useCallback(
    (selectedValue: string) => {
      onChange(selectedValue);
      setOpen(false);
      setQuery("");
    },
    [onChange]
  );

  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("");
      setQuery("");
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          variant="outline"
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-nx-md border border-nx-line bg-nx-ground px-3 text-start text-xs font-normal text-nx-ink transition-colors hover:bg-nx-hover hover:text-nx-ink focus:border-nx-accent focus:ring-1 focus:ring-nx-accent disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-nx-ink-3",
            ariaInvalid && "border-destructive focus:border-destructive focus:ring-destructive",
            className
          )}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <div className="flex shrink-0 items-center gap-1 text-nx-ink-3">
            {allowClear && value && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
                className="rounded-full p-0.5 hover:bg-nx-raised hover:text-nx-ink"
                title="Clear selection"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[240px] p-0 shadow-nx-lg" align="start">
        <Command
          filter={(itemValue, search) => {
            if (itemValue.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
            className="h-9 text-xs"
          />
          <CommandList className="max-h-56">
            <CommandEmpty className="py-2.5 text-center text-xs text-nx-ink-3">
              {emptyText}
            </CommandEmpty>

            {/* Creatable custom entry if query not empty and not in list */}
            {allowCreate && query.trim().length > 0 && !exactMatch && (
              <CommandGroup heading="Custom Location">
                <CommandItem
                  value={query.trim()}
                  onSelect={() => handleSelect(query.trim())}
                  className="flex cursor-pointer items-center gap-2 text-xs font-medium text-nx-accent hover:bg-nx-accent-wash"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{createLabel(query.trim())}</span>
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup>
              {normalizedOptions.map((option) => {
                const isSelected =
                  value.toLowerCase() === option.value.toLowerCase();
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
                        <span className="text-[10px] text-nx-ink-3">
                          {option.sublabel}
                        </span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 text-nx-accent",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
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
