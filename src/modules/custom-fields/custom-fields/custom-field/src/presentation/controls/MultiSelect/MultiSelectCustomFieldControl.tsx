"use client";

/**
 * MultiSelect's dedicated edit control -- Wave 3.1 Task 11.
 *
 * Task 10 proved `GenericSelect type="multi"` is the right underlying
 * primitive (it already renders chips, keyboard-operable per-chip removal,
 * a "+N" overflow popover, Select-All/Clear-All, and a correctly computed
 * accessible name -- see generic-select.tsx/select-trigger.tsx's own doc
 * comments, and the governing pre-plan analysis's §5.2, which found the
 * component "Exists, and it is mature" with ~18 live call sites already
 * exercising the WAI-ARIA listbox (multi-selectable) pattern this control
 * follows). What Task 10 deliberately left for this task (see its own
 * report's "Concerns" section) is CustomFields-specific business behaviour
 * that has no reason to live inside a component ~18 unrelated call sites
 * also use:
 *
 *   1. The backend's hard 19-selection ceiling
 *      (MultiSelectValueTypeHandler.MaxSelections, derived from ValueText's
 *      4000-char cap divided by FieldOption.LabelEn's 200-char cap -- see
 *      MULTI_SELECT_MAX_SELECTIONS below) must be enforced here, not just
 *      documented: composing a 25-selection answer and finding out via a
 *      422 on save is exactly the round-trip the brief calls out as
 *      unacceptable. Disabling every NOT-yet-selected option once the cap is
 *      hit actually PREVENTS a 20th pick (cmdk skips disabled rows in both
 *      pointer and keyboard navigation -- select-option-row.tsx's own
 *      `onSelect` guard: `if (option.disabled) return;`), rather than only
 *      describing the limit after the fact.
 *   2. A visible, live-announced selection counter -- "clearly communicate
 *      that limit" is a separate requirement from preventing it: a user
 *      approaching the cap should see it coming, not discover it only when
 *      the 20th option row goes grey.
 *
 * Selection ORDER is preserved with NO code in this file: GenericSelect's
 * own `currentValues` (use-select-options.ts) is exactly the `value` array
 * this component passes straight through, in both directions, and its
 * `selectedOptions` (what the chips render from) is `currentValues.map(...)`
 * -- so appending a new pick keeps prior picks in place, and removing one
 * never reorders the rest. This file must never sort or otherwise
 * re-derive that array, or it would silently start rendering definition
 * order instead of selection order -- the exact regression the brief warns
 * against.
 *
 * Accessible name: `aria-label` on GenericSelect (never `<Label htmlFor>`
 * alone) -- GenericSelect's trigger is a `<div role="combobox">`, and per
 * ARIA, role="combobox" is Name From: author, not Name From: contents, so a
 * `for`/`htmlFor` pointing at it computes NO accessible name (generic-
 * select.tsx's own prop doc comment traces the exact mechanism, and Wave 2
 * Step 2.2 had to fix this defect in four places after the fact). This
 * control is built with that lesson already applied, not re-discovering it.
 *
 * RTL: no direction-specific code here, deliberately. §5.2 of the governing
 * pre-plan analysis verified GenericSelect/SelectTrigger/SelectOptionRow are
 * "already clean" for RTL -- logical properties throughout (`pe-1`, `ps-2`,
 * `ms-auto`, `start-2`, `rtl:rotate-180`) and a `dir`-aware Radix `Popover`
 * for the panel -- and named nothing left to do. There is no LTR-pin rule
 * for selection chips the way `switch.tsx` pins ON physically right in both
 * languages (that rule is specific to a binary physical toggle, per project
 * memory); a MultiSelect's chips are ordinary inline content and correctly
 * follow `direction` like any other bidi-aware control.
 */
import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { isFieldRequired, type FieldConfig } from "@core/ui/forms/generic-form";

/**
 * Hard client-side selection ceiling, mirroring
 * `MultiSelectValueTypeHandler.MaxSelections` (CustomFields.Application,
 * Wave 3.1 Task 8) byte-for-byte: `ValueText` is capped at 4000 characters
 * and `FieldOption.LabelEn` at 200, so N newline-joined labels of the
 * worst-case 200 characters each consume `201*N - 1` characters; solving
 * `201*N - 1 <= 4000` gives `N <= 19.9...`, so 19 is the largest count that
 * can NEVER overflow `ValueText` regardless of how long the selected labels
 * happen to be. This is a storage constraint the server owns and enforces
 * (R5/R11 -- a code-owned constant, not a config knob); this constant exists
 * so the client can PREVENT the round trip, not to move the boundary.
 * `validateSelectCustomFieldValue` (renderCustomFieldControl.tsx) reuses
 * this exact constant for its own save-time membership/ceiling check, so
 * the two enforcement points can never drift apart.
 */
export const MULTI_SELECT_MAX_SELECTIONS = 19;

export interface MultiSelectCustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: string[]) => void;
  /** Mirrors every other renderCustomFieldControl branch's isViewMode contract. */
  isViewMode?: boolean;
  invalid?: boolean;
  describedBy?: string;
  error?: string;
}

/**
 * The MultiSelect branch's actual implementation, extracted out of
 * renderCustomFieldControl.tsx into its own component (rather than inlined
 * in that file's plain-function branch, the way the simpler Date/Switch/
 * Input branches are) because it owns real state-derived behaviour --
 * the ceiling/counter logic above -- that a single `if` branch returning
 * JSX would otherwise have to recompute inline, untested in isolation.
 */
export function MultiSelectCustomFieldControl({
  fc,
  value,
  onChange,
  isViewMode,
  invalid,
  describedBy,
  error,
}: MultiSelectCustomFieldControlProps): React.ReactElement {
  const isRequired = isFieldRequired(fc);
  const { t } = useI18n();
  const counterId = React.useId();

  // Defensive, matching the shared renderer's own established posture for
  // this exact type (renderCustomFieldControl.test.tsx: "treats a non-array
  // value defensively as an empty selection rather than throwing") -- a
  // value that has not been touched yet, or a stale non-array leftover, both
  // read as "nothing selected", never a crash.
  const selected = Array.isArray(value) ? (value as string[]) : [];
  const atCap = selected.length >= MULTI_SELECT_MAX_SELECTIONS;

  // Already-selected options stay enabled (their chip's remove button and
  // their panel row's checkbox must both keep working, or a user sitting at
  // the cap could never get back below it without "Clear all"). Every OTHER
  // option is disabled once the cap is hit -- this is what actually PREVENTS
  // a 20th selection, not just the counter text below.
  const options: GenericSelectOption[] = (fc.options ?? []).map((opt) => ({
    value: opt.value,
    label: opt.label,
    disabled: atCap && !selected.includes(opt.value),
  }));

  const counterText = atCap
    ? t("customField.multiSelect.maxSelectionsReached", { max: MULTI_SELECT_MAX_SELECTIONS })
    : t("customField.multiSelect.selectionCount", {
        count: selected.length,
        max: MULTI_SELECT_MAX_SELECTIONS,
      });

  return (
    <div className="space-y-2">
      <Label htmlFor={fc.name} className="text-sm font-medium">
        {fc.label}
        {isRequired && (
          <span className="ms-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <GenericSelect
        id={fc.name}
        // See this file's header comment -- `<Label htmlFor>` above is
        // real DOM wiring sighted users benefit from, but it is NOT what
        // computes this control's accessible name.
        aria-label={fc.label ?? fc.name}
        describedBy={[describedBy, counterId].filter(Boolean).join(" ")}
        options={options}
        value={selected}
        onValueChange={(v: string | string[]) => onChange(Array.isArray(v) ? v : [])}
        placeholder={fc.placeholder || fc.label}
        type="multi"
        searchable={true}
        required={isRequired}
        disabled={isViewMode}
        aria-invalid={invalid || undefined}
        className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
      />
      {invalid && error && (
        <p id={describedBy} className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {/*
        aria-live="polite", not throttled: unlike LongText's per-keystroke
        character counter (which the governing pre-plan analysis's §5.1
        explicitly says to throttle), a selection change is a discrete
        pointer/keyboard event, not a per-keystroke stream, so every change
        is worth announcing on its own.
      */}
      <p
        id={counterId}
        aria-live="polite"
        className={cn(
          "text-xs tabular-nums",
          atCap ? "font-medium text-nx-warning" : "text-nx-ink-3"
        )}
      >
        {counterText}
      </p>
    </div>
  );
}
