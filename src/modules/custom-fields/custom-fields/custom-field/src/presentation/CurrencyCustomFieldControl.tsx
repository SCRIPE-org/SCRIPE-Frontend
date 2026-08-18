"use client";

/**
 * Currency's dedicated edit control -- Wave 3.3 Batch C.
 *
 * Backend Task A (rulings R1/R2) stores Currency as two independently
 * required pieces -- a `decimal` amount in `ValueNumber` and a 3-uppercase-
 * letter ISO 4217 code in the new `ValueCurrencyCode` column -- and its own
 * `Descriptor` doc comment left the frontend's collection UI as an explicit
 * open decision: `FieldConfigType: "number"` was reused there only to avoid
 * inventing a backend-declared-but-frontend-unimplemented type (the
 * "time"/"color" trap in reverse), NOT as an instruction that the frontend
 * must render Currency through the shared bare-number Input fallthrough.
 * This module's own `FieldConfig["type"]` union has no cross-system
 * contract with the backend's `FieldConfigType` string (nothing on the wire
 * ever carries it -- `EntityCustomFieldValueData` has no `fieldConfigType`
 * field at all, only `valueType`), so this control is dispatched through a
 * genuinely new, dedicated `"currency"` `FieldConfig["type"]` member
 * (`generic-form.tsx`) instead, the same "give a type its own dispatch key
 * once its UI is genuinely different" precedent DateTime's own "datetime"
 * type already set over reusing "date".
 *
 * **Two inputs, one composite value, structured after DateTimeCustomFieldControl's
 * own `{ value, timeZoneId }` pattern.** The wire shape
 * (`CustomFieldCurrencyValue { amount, currencyCode }`) mirrors
 * `CurrencyValueTypeHandler.Parse`'s own `{ "amount", "currencyCode" }`
 * envelope exactly (CurrencyInput/CurrencyValue's own doc comments name
 * DateTimeZoneInput/DateTimeZoneValue as their precedent) -- so this control
 * mirrors DateTimeCustomFieldControl's own shape for the identical reason:
 * neither piece is meaningful alone, and a plain `toFieldInputValue(value)`
 * (`String(value)`) would stringify the object into the useless
 * "[object Object]" the way that trap already bit DateTime's own Task 10.
 *
 * **Half-blank prevention (the task brief's own R2-derived requirement):**
 * backend `IsEmpty` only short-circuits when BOTH pieces are missing
 * (Task A's own report, mirroring `DateTimeValueTypeHandler.IsEmpty`) --
 * typing only an amount or only a code is a genuinely INVALID submission,
 * not "nothing to save", and 422s at `Validate`. This control cannot by
 * itself prevent a user from stopping mid-entry, so two layers close the
 * gap client-side rather than leaving it to a round-trip 422:
 *   1. A static, always-visible hint (`customField.currency.pairHint`,
 *      `customField.longText`/`customField.dateTime`'s own "UI copy, not a
 *      rejected-save message" convention) states the requirement up front.
 *   2. `renderCustomFieldControl.tsx`'s `validateCurrencyCustomFieldValue`
 *      (wired into the existing `assertSelectCustomFieldValuesValid`
 *      save-flow guard, the SAME pre-save block point Select/MultiSelect's
 *      own D5 already uses) rejects a half-blank Currency value BEFORE
 *      `saveValues` is ever called, with a message naming the field -- see
 *      that function's own doc comment for why the exported name does not
 *      change even though it's no longer select-only.
 * Clearing BOTH pieces back to blank composes `null` (mirrors DateTime's own
 * "clearing the instant clears the WHOLE value, never a zone-only remnant"
 * rule) -- never a `{ amount: "", currencyCode: "" }` husk.
 *
 * **Currency code input is auto-uppercased and letter-filtered as the user
 * types.** `IsValidCurrencyCode` on the backend is deliberately
 * non-normalizing (a lowercase or padded submission is REJECTED, not
 * coerced -- Task A's own doc comment). Silently accepting lowercase here
 * and forwarding it unchanged would let a user type something that reads
 * correct on screen and still 422s on save for a reason invisible to them;
 * transforming the input's OWN displayed value to the only shape the
 * backend accepts (exactly 3 uppercase ASCII letters) keeps what the user
 * sees and what actually gets submitted the same string, always.
 *
 * **Accessible names: two genuinely independent native inputs, not a
 * composite widget.** Both the amount input (`type="number"`, ARIA role
 * `spinbutton`) and the code input (`type="text"`, ARIA role `textbox`) are
 * real, directly labelable HTML form controls -- unlike GenericSelect's
 * `role="combobox"` div or Radix Slider's Thumb, `<Label htmlFor>` and a
 * per-input `aria-label` both compute for real here with no decoy element in
 * the way, so `getByRole(..., { name })` genuinely proves what it appears
 * to prove (verified, not assumed -- see this control's own test file).
 * `role="group"` with an `aria-label` wraps both, the same GOV.UK
 * date-input shape `DateTimeCustomFieldControl`'s own header comment
 * documents for its own multi-piece value, so a screen reader announces the
 * field's name once on entry rather than reading two unrelated-sounding
 * inputs.
 */
import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import type { CustomFieldCurrencyValue } from "../../../custom-field-value/src/data/models/CustomFieldValueModel";

export interface CurrencyCustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: CustomFieldCurrencyValue | null) => void;
  /** Mirrors every other renderCustomFieldControl branch's isViewMode contract. */
  isViewMode?: boolean;
}

function isBlankAmount(amount: unknown): boolean {
  return amount === undefined || amount === null || amount === "";
}

export function CurrencyCustomFieldControl({
  fc,
  value,
  onChange,
  isViewMode,
}: CurrencyCustomFieldControlProps): React.ReactElement {
  const { t } = useI18n();

  const current =
    value && typeof value === "object" ? (value as Partial<CustomFieldCurrencyValue>) : undefined;
  const amount = current?.amount ?? "";
  const currencyCode = current?.currencyCode ?? "";

  const fieldName = fc.label ?? fc.name;

  // Composes the two pieces every time either changes -- `null` only when
  // BOTH are blank (see this file's own header comment). Never emits a
  // half-blank object silently; the half-blank STATE is allowed to exist in
  // the two inputs (a user has to be able to type one before the other),
  // it's only prevented from being silently treated as complete.
  const emit = (nextAmount: unknown, nextCode: string) => {
    if (isBlankAmount(nextAmount) && nextCode.trim() === "") {
      onChange(null);
      return;
    }
    onChange({ amount: nextAmount as number | string, currencyCode: nextCode });
  };

  const handleAmountChange = (raw: string) => emit(raw, currencyCode);
  // Uppercase + letters-only + 3-char clamp as the user types -- see this
  // file's own header comment on why this must match IsValidCurrencyCode's
  // exact accepted shape, not just "look" correct.
  const handleCodeChange = (raw: string) =>
    emit(amount, raw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3));

  return (
    <div role="group" aria-label={fieldName} className="space-y-2">
      <Label htmlFor={fc.name} className="text-sm font-medium">
        {fc.label}
      </Label>
      <div className="flex gap-2">
        <Input
          id={fc.name}
          aria-label={t("customField.currency.amountLabel", { field: fieldName })}
          type="number"
          value={String(amount)}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder={fc.placeholder}
          required={fc.required}
          disabled={isViewMode}
          className="flex-1 text-sm"
        />
        <Input
          id={`${fc.name}-currency-code`}
          aria-label={t("customField.currency.codeLabel", { field: fieldName })}
          type="text"
          value={currencyCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder={t("customField.currency.codePlaceholder")}
          maxLength={3}
          disabled={isViewMode}
          className="w-24 shrink-0 text-sm font-mono uppercase"
        />
      </div>
      <p className="text-xs text-nx-ink-3">{t("customField.currency.pairHint")}</p>
    </div>
  );
}
