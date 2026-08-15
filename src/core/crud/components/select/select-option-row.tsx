"use client";

import * as React from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { CommandItem } from "@core/ui/command";
import { Checkbox } from "@core/ui/checkbox";
import type { GenericSelectOption } from "../generic-select";

export interface SelectOptionRowProps {
  option: GenericSelectOption;
  selected: boolean;
  multi: boolean;
  /** Tree mode only: whether this node has children and is currently open. */
  expandable?: boolean;
  expanded?: boolean;
  /** Tree mode: reserve the disclosure column even on leaves, so labels align. */
  indent?: boolean;
  onToggleExpanded?: (value: string) => void;
  onSelect: (option: GenericSelectOption) => void;
}

/** One indent step per tree level. 16px is the spacing-4 step on the scale. */
const TREE_INDENT_PX = 16;

/**
 * A single option row.
 *
 * The indicator slot is reserved at the inline start for every row (`ps-8`), so
 * a tick appearing or disappearing never reflows the label. Selection is shown
 * by that indicator alone — the 2px accent bar CommandItem draws belongs to
 * cmdk's keyboard highlight, and using the same mark for both "this row is
 * highlighted" and "this row is chosen" would make the two indistinguishable.
 */
export function SelectOptionRow({
  option,
  selected,
  multi,
  expandable = false,
  expanded = false,
  indent = false,
  onToggleExpanded,
  onSelect,
}: SelectOptionRowProps) {
  const { t } = useI18n();
  const level = option.level ?? 0;

  return (
    <CommandItem
      // cmdk matches on `value`; the label is what the user actually types.
      value={`${option.label} ${option.value}`}
      disabled={option.disabled}
      onSelect={() => {
        if (option.disabled) return;
        onSelect(option);
      }}
      className="relative ps-8"
      style={level > 0 ? { marginInlineStart: level * TREE_INDENT_PX } : undefined}
    >
      <span className="absolute start-2 flex h-4 w-4 items-center justify-center">
        {multi ? (
          <Checkbox
            checked={selected}
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none"
          />
        ) : (
          selected && <Check className="h-4 w-4 text-nx-accent" aria-hidden="true" />
        )}
      </span>

      {/* cmdk owns `aria-selected` on its rows and uses it for the KEYBOARD
          highlight, overwriting anything passed in — so a screen reader would
          hear "selected" on whichever row the arrows are on and nothing on the
          rows actually chosen. The chosen state gets its own text channel. */}
      {selected && <span className="sr-only">{t("common.selected")}</span>}

      {indent &&
        (expandable ? (
          <button
            type="button"
            // Focusable on purpose. cmdk's keymap is arrows/Home/End/Enter only
            // and has no expand binding, so a tabIndex of -1 here left keyboard
            // users with no way to open a tree node at all — they could only
            // pick from whatever happened to be expanded already. The trade is
            // a focusable child inside a role="option"; being unable to reach
            // half the data is the worse of the two.
            aria-label={t(expanded ? "select.collapseGroup" : "select.expandGroup", {
              label: option.label,
            })}
            aria-expanded={expanded}
            onClick={(event) => {
              // The disclosure must not choose the node it belongs to.
              event.stopPropagation();
              onToggleExpanded?.(option.value);
            }}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onToggleExpanded?.(option.value);
              }
            }}
            className="-ms-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-nx-sm text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            <ChevronRight
              aria-hidden="true"
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                // The glyph points along the writing direction when closed and
                // down when open, in both locales.
                expanded ? "rotate-90" : "rtl:rotate-180"
              )}
            />
          </button>
        ) : (
          // Leaves reserve the same column, or a parent's label sits further in
          // than its own children and the tree reads ragged.
          <span aria-hidden="true" className="-ms-1 inline-block h-5 w-5 shrink-0" />
        ))}

      {option.icon && <span className="flex shrink-0 items-center">{option.icon}</span>}

      <span className="min-w-0 flex-1">
        {/* CSS truncation, not substring(): a label cut in JS loses its full
            text to the tooltip AND to copy-paste, and cuts at the wrong place
            in Arabic. */}
        <span
          className={cn("block truncate", indent && level === 0 && "font-semibold")}
          title={option.label}
        >
          {option.label}
        </span>
        {option.description && (
          <span className="block truncate text-xs text-nx-ink-3" title={option.description}>
            {option.description}
          </span>
        )}
      </span>
    </CommandItem>
  );
}
