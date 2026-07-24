"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { Badge } from "@core/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@core/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { appLogger } from "@core/common/logger";

type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  /** Server-backed search; when present, cmdk's local filtering is disabled. */
  onSearch?: (query: string) => Promise<Option[]>;
  disabled?: boolean;
}

// Rebuilt on Popover + Command: the option list is PORTALED (PopoverContent
// carries z-popover on the semantic ladder — the old inline dropdown clipped
// under overflow ancestors and pinned a raw z-10), searchable through
// CommandInput, and keyboard-navigable through cmdk. The trigger wears the
// shared field surface; focus lights the edge exactly like Input.
export function MultiSelect({
  options: initialOptions,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
  onSearch,
  disabled = false,
}: MultiSelectProps) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [internalOptions, setInternalOptions] = React.useState<Option[]>(initialOptions);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setInternalOptions(initialOptions);
  }, [initialOptions]);

  // Server search rides a 300ms debounce; local filtering stays cmdk's job.
  React.useEffect(() => {
    if (!onSearch) return;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await onSearch(inputValue);
        setInternalOptions(results);
      } catch (error) {
        appLogger.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, onSearch]);

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      handleUnselect(value);
    } else {
      onChange([...selected, value]);
      setInputValue("");
    }
  };

  // Chips must keep their labels even when a server-search page no longer
  // contains the selected value.
  const labelFor = (value: string) =>
    internalOptions.find((o) => o.value === value)?.label ??
    initialOptions.find((o) => o.value === value)?.label ??
    value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* A div, not a button: the chip remove controls inside are real
            buttons and nesting them would be invalid markup. The div carries
            the combobox role, its own key handling, and the disabled
            treatment (unfocusable + pointer-events off) instead. */}
        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className={cn(
            // The shared field surface: sunken ground behind a hairline, the
            // same hover lift as Input; focus (and the open state — the field
            // stays the active thing while its list is up) lights the edge.
            "flex min-h-10 w-full cursor-pointer flex-wrap items-center gap-1 rounded-nx-control border border-nx-line bg-nx-ground px-3 py-2 text-sm text-nx-ink transition-[color,border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:border-nx-line-hi focus-visible:outline-none focus-visible:border-nx-accent focus-visible:shadow-nx-focus",
            open && "border-nx-accent shadow-nx-focus",
            // inert: the raised slab and ink-3, exactly like a disabled Input —
            // not the whole control at half strength
            disabled &&
              "pointer-events-none cursor-not-allowed border-nx-line bg-nx-raised text-nx-ink-3 shadow-none",
            className
          )}
        >
          {selected.map((value) => {
            const label = labelFor(value);
            return (
              <Badge key={value} variant="secondary" className="gap-1 ps-2 pe-1">
                {label}
                {/* the negative margin buys the 12px glyph a real hit box
                    without widening the chip */}
                <button
                  type="button"
                  aria-label={`${t("common.remove")} ${label}`}
                  className="-my-1 -me-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover hover:text-nx-ink focus-visible:outline-none focus-visible:shadow-nx-focus"
                  onClick={(e) => {
                    // Removing a chip must not toggle the popover.
                    e.stopPropagation();
                    handleUnselect(value);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </Badge>
            );
          })}
          {selected.length === 0 && <span className="text-nx-ink-3">{placeholder}</span>}
          <ChevronsUpDown className="ms-auto h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-40 p-0"
      >
        <Command shouldFilter={!onSearch}>
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            placeholder={t("common.search")}
            onKeyDown={(e) => {
              // Backspace on an empty query removes the last chip — the same
              // affordance the old inline build had.
              if (e.key === "Backspace" && inputValue === "" && selected.length > 0) {
                onChange(selected.slice(0, -1));
              }
            }}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? t("common.searching") : t("common.noResults")}
            </CommandEmpty>
            <CommandGroup>
              {internalOptions.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleToggle(option.value)}
                    className="cursor-pointer"
                  >
                    <span className="flex-1 truncate">{option.label}</span>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0 text-nx-accent",
                        // reserved, not faded — the row must not shift when a
                        // tick appears
                        isSelected ? "visible" : "invisible"
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
