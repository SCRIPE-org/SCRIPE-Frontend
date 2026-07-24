"use client";

/**
 * The select surface — ONE skin, built from tokens.
 *
 * This file used to be a ~460-line switch over 26 invented skins — the full
 * list survives in exactly one place, `RETIRED_SELECT_STYLES` in
 * core/settings/merge-engine.ts, because that list has a job to do. Every arm
 * hardcoded a palette family and a shadow ladder of its own, so the select was
 * the one control in the product that never matched the field beside it: an
 * Input rendered the shared `--nx-ground` sunken surface while the Select next
 * to it rendered a violet gradient with a 2xl amber glow. Several arms also
 * animated at rest (pulse, spin, ping), which is banned outright. Four arms
 * were unreachable duplicates of earlier ones.
 *
 * The skin below is the SAME surface language `input.tsx` publishes — sunken
 * `--nx-ground` behind a hairline, hover lifts the hairline one step, focus is
 * the lit edge (`--nx-focus`), disabled is a flat `--nx-raised` slab with
 * `--nx-ink-3` ink — so a form reads as one control repeated.
 *
 * Stored copies of the 25 retired names are normalised to "default" by
 * `migrateStoredSettings` (core/settings/merge-engine.ts), so nothing a user
 * ever saved can reach this file as an unknown value.
 */

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import {
  calculateDropdownPosition,
  scrollIntoViewIfNeeded,
  type DropdownPosition,
} from "@core/common/dropdown-positioning";

// Re-export for use in other components
export { calculateDropdownPosition, scrollIntoViewIfNeeded, type DropdownPosition };

// ── The one skin ──────────────────────────────────────────────────────────

// The trigger is a `div[role="combobox"]` rather than a `<button>` because it
// hosts the multi-select chips, and each chip carries its own remove button —
// a button inside a button is invalid markup. The `disabled:` variants below
// are kept because they are the field language's own; the div also gets the
// explicit inert classes in `getGenericSelectStyles`, since a div never
// matches `:disabled`.
const TRIGGER = cn(
  "flex min-h-10 w-full items-center justify-between rounded-nx-control",
  "border border-nx-line bg-nx-ground px-3 text-sm text-nx-ink text-start",
  "transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
  "hover:border-nx-line-hi focus-visible:outline-none focus-visible:shadow-nx-focus",
  "disabled:bg-nx-raised disabled:text-nx-ink-3"
);

const TRIGGER_INERT = "cursor-not-allowed bg-nx-raised text-nx-ink-3 hover:border-nx-line";

const PANEL = "rounded-nx-md border border-nx-line bg-nx-popover text-nx-ink shadow-nx-popover";

// A chip is a reading of what is selected, so it wears the selection tone.
// `--nx-*` tokens hold complete colour values, which makes Tailwind's
// slash-alpha a silent no-op — the border tint goes through color-mix, exactly
// as badge.tsx does.
const CHIP = cn(
  "border border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)]",
  "bg-nx-accent-wash text-nx-accent"
);

/** Resting option row. Hover is a tint; nothing lifts, nothing glows. */
export const SELECT_ITEM = cn(
  "group relative flex w-full select-none items-center gap-2 rounded-nx-sm px-3 py-2",
  "text-sm text-start text-nx-ink outline-none",
  "transition-[color,background-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
  "hover:bg-nx-hover focus-visible:shadow-nx-focus"
);

/** Selected option row — the wash plus accent ink, no border, no shadow. */
export const SELECT_ITEM_SELECTED = "bg-nx-accent-wash text-nx-accent";

/** An option the caller marked unavailable: inert ink, no pointer answer. */
export const SELECT_ITEM_DISABLED = "pointer-events-none text-nx-ink-3";

export interface GenericSelectStyles {
  trigger: string;
  panel: string;
  chip: string;
}

/**
 * The select's surface classes. There is no `design` argument any more: the
 * SelectStyle union is a single member, so there is nothing left to branch on.
 */
export function getGenericSelectStyles(
  disabled?: boolean,
  className?: string
): GenericSelectStyles {
  return {
    trigger: cn(TRIGGER, disabled ? TRIGGER_INERT : "cursor-pointer", className),
    panel: PANEL,
    chip: CHIP,
  };
}

// Responsive text handling utility
export const getResponsiveText = (text: string, maxLength: number = 25) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * One selected value inside the multi-select trigger.
 *
 * `title` carries the untruncated label — it is the value itself, not chrome
 * copy, so it needs no `t()`. The remove control does: an icon-only button
 * with no accessible name announced as "button" in both languages.
 */
export const ResponsiveChip: React.FC<{
  label: string;
  onRemove: () => void;
  className?: string;
}> = ({ label, onRemove, className }) => {
  const { t } = useI18n();
  const displayLabel = getResponsiveText(label, 20);

  return (
    <span
      className={cn(
        "inline-flex max-w-[150px] items-center gap-1 rounded-nx-sm px-2 py-1 text-xs font-medium",
        className
      )}
      title={label}
    >
      <span className="truncate">{displayLabel}</span>
      <button
        type="button"
        aria-label={t("select.chip.remove", { label })}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          "inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full",
          "transition-[color,background-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
          "hover:bg-nx-hover focus-visible:outline-none focus-visible:shadow-nx-focus"
        )}
      >
        <X className="h-2.5 w-2.5" aria-hidden="true" />
      </button>
    </span>
  );
};
