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
 *
 * Because the amount input carries that `aria-label`, and `aria-label` outranks
 * every `<label>` in the accname cascade, the `<Label htmlFor={fc.name}>` below
 * is a VISIBLE label rather than the amount's accessible name. That is also why
 * `<GenericForm>` must suppress its own label for this type -- the duplicate it
 * would add is visual, not announced, which is a different failure from
 * Duration's doubled native name and from the reference control's un-nameable
 * combobox div. All three are recorded at `EXTENSION_DRAWN_FIELD_TYPES` in
 * `core/ui/forms/generic-form.tsx`.
 *
 * ── Reviewed for generic-form use (Wave 4 follow-up). What changed, and what
 * deliberately did not ────────────────────────────────────────────────────────
 *
 * KEPT: the layout. `flex gap-2` with the amount `flex-1` and the code
 * `w-24 shrink-0` is this repo's own side-by-side composite precedent (it is a
 * closer fit than DateTimeCustomFieldControl's, which despite its doc comment is
 * actually STACKED -- checked, not inherited from that comment), and gap-based
 * flex follows `direction` for free, so RTL puts the code on the inline end with
 * no per-direction fork.
 *
 * KEPT: free text for the code, NOT a `<select>` of `SUPPORTED_CURRENCIES`.
 * `IsValidCurrencyCode` accepts any three uppercase ASCII letters including
 * codes no registry lists, and the handler's own comment refuses to treat any
 * in-repo list as a currency registry ("a tenant's own field may legitimately
 * hold any of ~180 ISO 4217 codes"). An options-only control would remove valid
 * input -- so `SUPPORTED_CURRENCIES` arrives as a native `<datalist>` instead:
 * suggestions layered on, never replacing free text. That distinction, and the
 * "needs no new component (none in @core/ui accepts both), stays keyboard- and
 * screen-reader-navigable by construction" reasoning, is
 * `PermissionConfigDialog.tsx`'s, for its own free-text-with-suggestions field.
 *
 * KEPT: no default code. Pre-filling "USD" would silently attach a currency the
 * operator never chose to an amount they did type -- invisible wrong data, which
 * is worse than a visible blank the pair hint and the pair-completion `required`
 * below both point at.
 *
 * ADDED: `step="any"` on the amount -- the honest declaration for a
 * `decimal(18,6)` column the handler never rounds, and a latent-trap guard
 * rather than a live bug fix. The distinction was measured, not assumed, because
 * the same omission IS a live bug one file over: an `<input type="number">` with
 * no `step` steps by 1, and a value off that step blocks native submission
 * outright (`<GenericForm>`'s `<form>` carries no `noValidate`) -- but the step
 * BASE is `min` if present, else the `value` content attribute, else 0. This
 * input has no `min`, and React keeps a controlled input's `value` attribute in
 * sync, so the base tracks the current amount and `19.99` never mismatched.
 * `DurationCustomFieldControl` has `min={0}`, which pins its base at 0 and made
 * `1.5` genuinely unsubmittable -- see that file. So this is here because the
 * declaration is right and because the FIRST person to add a `min` to a price
 * field (an entirely reasonable thing to want) would otherwise make every
 * amount with cents unsubmittable, with nothing to warn them.
 *
 * NOT added: a `min` on the amount. The handler enforces none, and a credit or a
 * refund is a real currency value.
 *
 * ADDED: `pattern="[A-Z]{3}"` on the code -- `IsValidCurrencyCode`'s exact
 * grammar, so a two-letter "US" is refused in the browser instead of coming back
 * a `currencyCodeInvalid` 422. Same move, same reason, as
 * `FieldGroupEditor.tsx`'s stable-key input ("Mirrors the server's own regex ...
 * so an invalid key is caught before a round trip rather than after one").
 *
 * ADDED: pair-completion `required` -- each piece becomes required exactly while
 * the OTHER one is populated, which is `IsEmpty`/`Validate`'s both-or-neither
 * rule expressed natively. This matters most on the generic screens: the module's
 * own pre-save guard (`assertSelectCustomFieldValuesValid`, which calls
 * `validateCurrencyCustomFieldValue`) is wired into the 8 hand-wired viewmodels
 * and NOT into generic-crud-view, so a half-blank Currency on a generic screen
 * had nothing between it and a 422.
 *
 * ADDED: `dir="ltr"` on the code input. An ISO 4217 code is a machine token like
 * `FieldGroupEditor`'s stable key or `DefinitionFormDialog`'s plugin key, both of
 * which pin LTR for the same reason, and `resolveIntlLocale`'s own comment names
 * the policy this serves -- Latin-script currency codes are what Arabic UI
 * numerals are kept legible NEXT TO. The amount is deliberately left inheriting
 * the page direction, matching GenericForm's own `dir={direction}` number branch:
 * a quantity is not a machine token.
 */
import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import { resolveIntlLocale } from "@core/common/utils";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import type { CustomFieldCurrencyValue } from "../../../custom-field-value/src/data/models/CustomFieldValueModel";

export interface CurrencyCustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: CustomFieldCurrencyValue | null) => void;
  /** Mirrors every other renderCustomFieldControl branch's isViewMode contract. */
  isViewMode?: boolean;
  /**
   * The HOST form's validation verdict for this field, when it has one. Supplied
   * by `GenericFormCustomFieldControl` (GenericForm holds an `errors` map and
   * renders its own error node); absent at the 8 hand-wired sites, which validate
   * at save time instead. See `CustomFieldControlProps` in
   * renderCustomFieldControl.tsx.
   *
   * Applied to BOTH inputs, not to the wrapping group: `Input`'s own error edge is
   * driven by `aria-[invalid=true]:border-nx-danger` (core/ui/input.tsx), so a
   * verdict parked on the group would paint nothing at all, and either piece can
   * be the reason the field was rejected.
   */
  invalid?: boolean;
  /** Id of the host's hint/error node, composed into both inputs' descriptions. */
  describedBy?: string;
}

function isBlankAmount(amount: unknown): boolean {
  return amount === undefined || amount === null || amount === "";
}

/**
 * The datalist's suggestion rows: this product's supported currencies, each
 * labelled with its own name in the reader's language.
 *
 * `Intl.DisplayNames` rather than `SUPPORTED_CURRENCIES[].name`, whose values are
 * hardcoded English ("Saudi Riyal") and would have been the one untranslated
 * string in an otherwise bilingual control. Wrapped in try/catch and falling back
 * to that English name for the same reason `formatCustomFieldValue.tsx`'s own
 * Currency case wraps `Intl.NumberFormat` -- these constructors throw for input
 * they cannot represent, and degrading to the raw stored data beats throwing
 * inside a render.
 *
 * Suggestions only: a code absent from this list is still perfectly typeable and
 * perfectly storable (see this file's header comment on why an options-only
 * control would be wrong).
 */
function currencySuggestions(language: string): Array<{ code: string; label: string }> {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([resolveIntlLocale(language)], { type: "currency" });
  } catch {
    names = null;
  }
  return SUPPORTED_CURRENCIES.map((currency) => {
    let localized: string | undefined;
    try {
      localized = names?.of(currency.code);
    } catch {
      localized = undefined;
    }
    return { code: currency.code, label: localized ?? currency.name };
  });
}

export function CurrencyCustomFieldControl({
  fc,
  value,
  onChange,
  isViewMode,
  invalid,
  describedBy,
}: CurrencyCustomFieldControlProps): React.ReactElement {
  const { t, language } = useI18n();

  const current =
    value && typeof value === "object" ? (value as Partial<CustomFieldCurrencyValue>) : undefined;
  const amount = current?.amount ?? "";
  const currencyCode = current?.currencyCode ?? "";

  const fieldName = fc.label ?? fc.name;
  const pairHintId = `${fc.name}-pair-hint`;
  const suggestionsId = `${fc.name}-currency-suggestions`;
  // Composed, never overwritten -- `aria-describedby` takes an id LIST, so the
  // host's own hint/error keeps its place ahead of this control's pairing rule.
  // Same composition `EntityReferenceCustomFieldControl` already does for its own
  // note.
  const describedByValue = [describedBy, pairHintId].filter(Boolean).join(" ");
  const suggestions = React.useMemo(() => currencySuggestions(language), [language]);

  // The both-or-neither rule, made native. `CurrencyValueTypeHandler.IsEmpty`
  // short-circuits only when BOTH pieces are missing; anything else reaches
  // `Validate`, which demands both. So a populated piece is exactly what makes
  // its partner mandatory -- and `fc.required` still forces both from the start.
  // The half-blank STATE is still allowed to exist mid-entry (the user has to be
  // able to type one before the other); this only stops it being SUBMITTED.
  const codePopulated = currencyCode.trim() !== "";
  const amountPopulated = !isBlankAmount(amount);
  const amountRequired = Boolean(fc.required) || codePopulated;
  const codeRequired = Boolean(fc.required) || amountPopulated;

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
          // The honest step for a decimal(18,6) amount the handler never rounds.
          // See this file's header comment for why it is a guard rather than a
          // live fix here (no `min`, so the step base tracks the value) and for
          // the trap it closes the moment anyone adds one. No `min`, because the
          // handler enforces none: a credit is a real currency value.
          step="any"
          value={String(amount)}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder={fc.placeholder}
          required={amountRequired}
          disabled={isViewMode}
          aria-invalid={invalid || undefined}
          aria-describedby={describedByValue}
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
          // IsValidCurrencyCode's exact grammar. The keystroke filter above
          // already guarantees uppercase letters only, so in practice this
          // catches the one shape it cannot -- a code stopped at one or two
          // letters -- before a round trip rather than after one.
          pattern="[A-Z]{3}"
          required={codeRequired}
          // Suggestions, not a constraint: the value stays free text (see this
          // file's header comment on why an options-only control would be wrong).
          list={suggestionsId}
          // A machine token, kept LTR in every locale like this codebase's other
          // machine keys. No accompanying text-align override is needed and none
          // is added: the inherited `text-align: start` resolves against THIS
          // element's own direction, so pinning `dir` already leading-aligns it.
          dir="ltr"
          // Nothing to autofill and nothing to spell-check in a 3-letter code;
          // `autoComplete="off"` matches GenericForm's own Input default.
          autoComplete="off"
          spellCheck={false}
          disabled={isViewMode}
          aria-invalid={invalid || undefined}
          aria-describedby={describedByValue}
          className="w-24 shrink-0 font-mono text-sm uppercase"
        />
        <datalist id={suggestionsId}>
          {suggestions.map((suggestion) => (
            // `label` carries the human name, because a datalist option has
            // nowhere else to put one -- the same shape PermissionConfigDialog's
            // own suggestion list uses.
            <option key={suggestion.code} value={suggestion.code} label={suggestion.label} />
          ))}
        </datalist>
      </div>
      <p id={pairHintId} className="text-xs text-nx-ink-3">
        {t("customField.currency.pairHint")}
      </p>
    </div>
  );
}
