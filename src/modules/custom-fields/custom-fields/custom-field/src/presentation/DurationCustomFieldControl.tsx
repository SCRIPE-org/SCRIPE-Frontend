"use client";

/**
 * Duration's dedicated edit control -- Wave 3.3 Batch C.
 *
 * Backend ruling R4: storage is bare MINUTES in `ValueNumber` (`decimal`, so
 * 1.5 = 90 seconds), non-negative, with the unit deliberately left implicit
 * in storage -- the handler's own doc comment states the unit must be made
 * explicit "at the handler and in the operator guide", the same PD-2
 * ambiguity Percent's 0-100 (not 0-1) storage decision already exists to
 * avoid for a different type. A bare `<input type="number">` showing `90`
 * with no unit repeats exactly that ambiguity at the UI layer, so this
 * control exists specifically to append a real, localized "minutes"
 * annotation next to the field -- not to add any other behaviour beyond
 * what the shared Input fallthrough already gives Number/Percent.
 *
 * **Why a dedicated component rather than one more inline `if` branch in
 * `renderCustomFieldControl.tsx`:** that function is deliberately hookless
 * (its own doc comment: calling `useI18n()` from a plain, non-component
 * function would trip `react-hooks/rules-of-hooks` and silently break its
 * established "plain function" contract), and the unit label MUST be
 * localized like every other visible string in this module -- a hardcoded
 * English "min" would be the one un-translated string in an otherwise
 * bilingual (en/ar) surface. Extracting a small real component (the same
 * move LongText/MultiSelect/DateTime's own Task 11/12 already made for
 * similar reasons) is the only way to call `useI18n()` here at all.
 *
 * **Why a genuinely new `"duration"` `FieldConfig["type"]`, not reused
 * `"number"`:** backend Task B's own Descriptor reuses `FieldConfigType:
 * "number"` for Duration (matching Number/Percent/Currency's own
 * `FieldConfigType` string) -- but that string is never transmitted to this
 * frontend at all (`EntityCustomFieldValueData` carries only `valueType`;
 * `fieldConfigType` is this module's OWN presentation-layer catalog
 * decision, `VALUE_TYPE_CATALOG`, not a wire contract with the backend). If
 * this control's catalog entry also said `fieldConfigType: "number"`,
 * `renderCustomFieldControl` would have no way to tell a Duration field
 * apart from a plain Number/Percent field (both would arrive as
 * `fc.type === "number"`) and could never render this dedicated unit
 * annotation without also changing every other Number-shaped field's
 * output. A dedicated `"duration"` dispatch key sidesteps that collision
 * entirely -- the same reasoning `CurrencyCustomFieldControl`'s own header
 * comment gives for its own dedicated `"currency"` key.
 *
 * **Accessible name:** a single real, directly labelable
 * `<input type="number">` -- `<Label htmlFor>` computes a real accessible
 * name here with no decoy element involved (unlike GenericSelect/Slider),
 * verified via `getByRole("spinbutton", { name })` in this file's own test
 * and in `renderCustomFieldControl.test.tsx`'s completeness gate. Matching
 * the Email/Url/Phone branches' own `{fc.label ?? fc.name}` fallback (Wave
 * 3.2 Batch 3's own real, found-and-fixed bug: an undefined `fc.label`
 * rendering an EMPTY `<Label>` otherwise), not a fresh translated
 * `aria-label` override -- there is no second/auxiliary control here the
 * way Currency's paired code input needs one, so the plain native
 * `for`/`id` association is both correct and sufficient on its own. The
 * unit annotation is a plain VISIBLE sibling `<span>` (never `aria-hidden`),
 * the same "un-hidden baseline row" shape the Rating branch's own
 * `{numericValue} / {RATING_MAX}` read-out already uses -- a screen reader
 * traversing the form encounters the input's name, then the unit text, in
 * natural DOM order, with no interpolation or second locale key needed.
 */
import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import type { FieldConfig } from "@core/ui/forms/generic-form";

export interface DurationCustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  /** Mirrors every other renderCustomFieldControl branch's isViewMode contract. */
  isViewMode?: boolean;
}

function toFieldInputValue(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

export function DurationCustomFieldControl({
  fc,
  value,
  onChange,
  isViewMode,
}: DurationCustomFieldControlProps): React.ReactElement {
  const { t } = useI18n();
  const unitLabel = t("customField.duration.unitLabel");

  return (
    <div className="space-y-2">
      <Label htmlFor={fc.name} className="text-sm font-medium">
        {fc.label ?? fc.name}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={fc.name}
          type="number"
          min={0}
          value={toFieldInputValue(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fc.placeholder}
          required={fc.required}
          disabled={isViewMode}
          className="max-w-[10rem] text-sm"
        />
        {/* Visible, never aria-hidden -- a screen reader already announces
            this in natural DOM order right after the input's own real name
            (fieldName, via <Label htmlFor> above), the same un-hidden
            baseline-row shape the Rating branch's own "N / 5" read-out
            uses. Storage is bare minutes (backend ruling R4); this is the
            one place that unit becomes explicit instead of implicit. */}
        <span className="shrink-0 text-sm text-nx-ink-3">{unitLabel}</span>
      </div>
    </div>
  );
}
