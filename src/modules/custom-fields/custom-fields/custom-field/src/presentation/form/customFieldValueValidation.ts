/**
 * Client-side custom-field VALUE validation -- the D5 mirror of the backend's own
 * per-value-type `Validate`, plus the save-flow entry point every consumer calls.
 *
 * Lifted out of `renderCustomFieldControl.tsx` (same folder), which had grown to hold
 * two unrelated halves under one filename: a render-time dispatcher keyed on
 * `FieldConfig["type"]`, and this submit-time verdict machinery. They are read by two
 * disjoint sets of consumers -- the nine host viewmodels import only
 * `assertSelectCustomFieldValuesValid` + `CustomFieldValidationError` from here, while the
 * eight custom-field form sections import only `renderCustomFieldControl` from there -- and
 * nothing in either half calls the other. Every export below is unchanged, including its
 * name and signature; only the file it lives in is new, and both are re-exported through
 * the submodule barrel so no consumer can tell.
 *
 * `renderCustomFieldControl` deliberately does NOT auto-call any of these: see
 * `validateSelectCustomFieldValue`'s own comment on why the shared edit renderer must stay
 * render-agnostic, and `assertSelectCustomFieldValuesValid`'s on where the other half of
 * that contract is honoured.
 */
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { MULTI_SELECT_MAX_SELECTIONS } from "../controls/MultiSelect/MultiSelectCustomFieldControl";

/**
 * Matches useI18n()'s own real `t` signature (i18n-provider.tsx:28) without
 * importing the provider. Was previously `Record<string, unknown>` -- wider
 * than the real `t`'s `Record<string, string | number>` params, which is
 * only safe as long as nothing ever passes the actual useI18n() `t` in here
 * (TypeScript's contravariant function-parameter check rejects a narrower-
 * accepting function wherever a wider-accepting one is promised). That held
 * by accident while `validateSelectCustomFieldValue` had zero production
 * callers (final whole-branch review, I3) -- the first real caller
 * (`assertSelectCustomFieldValuesValid`, wired into a real save flow) passes
 * the real `t` and surfaced the mismatch as a build-time type error.
 * Narrowed to match reality: every param object this module ever builds
 * (`{ value: text, field: fc.label ?? fc.name }`) is string-valued anyway.
 */
export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

/**
 * D5: client-side mirror of the backend's `SelectValueTypeHandler.Validate` --
 * an ordinal (case-sensitive) membership check of `value` against `fc.options`,
 * matching the backend's `StringComparer.Ordinal` comparison against
 * `CustomField.Options` exactly. Deliberately NOT case-insensitive: loosening
 * this "to be more forgiving" would make the frontend accept values the
 * backend still rejects with a 422 (or reject values the backend would
 * accept) -- the entire point of D5 is to fail with the SAME verdict the
 * backend would reach, just earlier and with a better message, not a
 * DIFFERENT verdict reached earlier.
 *
 * Returns `null` when `value` is empty/absent/whitespace-only (required-ness
 * is a separate, pre-existing concern -- see this module's own generic
 * "required" validation -- not this function's job) or when `fc.type` isn't
 * "select" or "multi-select" at all, and the (already-interpolated) error
 * message string otherwise. Whitespace-only ("   ") is deliberately treated
 * the SAME as fully-empty, not as "not one of the allowed options": the
 * backend's `SelectValueTypeHandler.IsEmpty` is `string.IsNullOrWhiteSpace`-
 * based and is checked BEFORE `Validate` ever runs (see
 * `SaveEntityCustomFieldValuesCommandHandler.cs`'s empty-value gate, and Wave
 * 2 Step 2.1's own D35 ruling) -- so the backend would accept a whitespace-
 * only submission as "clear this value," never reject it as invalid. Checking
 * membership before the blank check would make this function reject a value
 * the backend happily treats as empty, the exact kind of frontend/backend
 * verdict mismatch D5 exists to eliminate, not reintroduce.
 *
 * NOT called automatically from the Select/MultiSelect branches above.
 * `GenericSelect` only ever emits a value drawn from that branch's own
 * `options` array (built from `fc.options`), so a value reaching `onChange`
 * through the picker UI can never be out-of-list or over the MultiSelect
 * ceiling (`MultiSelectCustomFieldControl` disables every option once the
 * cap is hit) -- gating `onChange` itself would be dead defensive code with
 * no real attack surface via the UI. The actual risk this closes is a STALE
 * value already sitting in form state reaching a save/submit flow (e.g. a
 * field's `Options` were edited, or its cardinality shrank, after this value
 * was captured) -- exactly the case the backend's own 422 exists for today,
 * and exactly what a consumer should check before calling its save API, not
 * on every keystroke.
 *
 * Exported as a separate, hookless function rather than folded into
 * `renderCustomFieldControl` itself or making that function hook-based:
 * `renderCustomFieldControl` is invoked as a plain function call mid-render by
 * all 8 consumer sites (`{renderCustomFieldControl({...})}`), not mounted as
 * its own component -- giving IT a `useI18n()` call would still technically
 * run (React does not care that the enclosing call isn't shaped like a
 * component), but it would trip `react-hooks/rules-of-hooks` lint (the
 * function name starts with neither `use` nor a capital letter, so tooling
 * can't recognize it as a component or a hook) and silently change this
 * file's own established "plain function" contract from Tasks 2-3. Every one
 * of the 8 sites already holds its own `t` from `useI18n()` for its section
 * headings, so threading it through here as an explicit parameter costs
 * nothing new and keeps this file's only hook-free.
 *
 * Wave 3.1 Task 11 generalizes this to "multi-select" (Task 10's own report
 * flagged it as a "must build" item left undone: `validateSelectCustomFieldValue`
 * was hard-gated to `fc.type === "select"`, so a bad MultiSelect payload
 * silently passed here and only failed as a round-trip 422 -- reopening
 * exactly the gap the original D5 fix round closed for Select). The name
 * stays `validateSelectCustomFieldValue` -- not renamed -- because every
 * existing call site (this file's own `assertSelectCustomFieldValuesValid`,
 * every one of the 9 wired save flows, and this file's own test suite)
 * already calls it as the one per-field validation entry point regardless of
 * which options-owning type `fc` turns out to be; a rename would be a
 * purely cosmetic churn across all of them for no behavioural gain.
 */
export function validateSelectCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type === "multi-select") {
    return validateMultiSelectCustomFieldValue(fc, value, t);
  }
  if (fc.type !== "select") return null;
  if (value === undefined || value === null) return null;

  // Trimmed BEFORE the emptiness check (not just before the membership
  // check): the backend's IsEmpty gate runs on the trimmed/whitespace-aware
  // value ahead of Validate, so " " must resolve to "empty" here too, not
  // fall through to the membership check below and get rejected as "not one
  // of the allowed options" -- see the doc comment above.
  const text = String(value).trim();
  if (text === "") return null;

  const allowedLabels = fc.options?.map((opt) => opt.label) ?? [];

  // Ordinal / case-sensitive on purpose -- see the doc comment above.
  if (!allowedLabels.includes(text)) {
    return t("customField.values.selectInvalidOption", {
      value: text,
      field: fc.label ?? fc.name,
    });
  }

  return null;
}

/**
 * MultiSelect's half of D5, mirroring `MultiSelectValueTypeHandler.Validate`
 * (CustomFields.Application, Wave 3.1 Task 8) check-for-check and in the
 * SAME order, so this reaches the identical verdict the backend would --
 * only earlier, and with a message the user can act on immediately instead
 * of after a round-trip 422:
 *
 *   1. `submitted.Count > MaxSelections` -- `ErrorCodes.MaxLength`, message
 *      key `multiSelectTooManySelections`. Checked FIRST, exactly like the
 *      backend, so an over-the-ceiling submission is never also reported as
 *      "contains an invalid option" even if it happens to have one.
 *   2. Per label, trimmed: membership against `fc.options` (ordinal,
 *      case-sensitive -- reuses `selectInvalidOption`, the SAME message key
 *      Select's own membership check uses, because it is the SAME concept:
 *      "not one of the allowed options"), then
 *   3. duplicate detection (`ErrorCodes.Unique`, message key
 *      `multiSelectDuplicateOption`) -- a MultiSelect value is a SET, not a
 *      multiset, matching the backend's own stated reasoning ("selecting
 *      'Red' twice has no meaning a single 'Red' doesn't already carry").
 *
 * `MULTI_SELECT_MAX_SELECTIONS` is imported from
 * `MultiSelectCustomFieldControl.tsx` (not re-declared here) so the UI's
 * ceiling-enforcement and this save-time check can never drift to two
 * different numbers.
 *
 * A non-array `value` (untouched field, or a stale non-array leftover) is
 * treated as an empty selection, not an error -- required-ness is a
 * separate, pre-existing concern, exactly like the scalar Select branch
 * above, and matches `MultiSelectCustomFieldControl`'s own defensive
 * posture for the same input shape.
 */
function validateMultiSelectCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (value === undefined || value === null) return null;
  if (!Array.isArray(value) || value.length === 0) return null;

  if (value.length > MULTI_SELECT_MAX_SELECTIONS) {
    return t("customField.values.multiSelectTooManySelections", {
      field: fc.label ?? fc.name,
      max: MULTI_SELECT_MAX_SELECTIONS,
    });
  }

  const allowedLabels = fc.options?.map((opt) => opt.label) ?? [];
  const seen = new Set<string>();

  for (const raw of value) {
    // Trim, matching the backend's `raw?.Trim() ?? string.Empty` -- not a
    // blank-is-empty special case the way the scalar Select branch has one:
    // an array ENTRY that happens to be blank/whitespace is validated like
    // any other string, exactly what MultiSelectValueTypeHandler.Validate
    // does (it has no per-entry emptiness exemption, only the whole-array
    // IsEmpty([]) check, which is handled above).
    const text = String(raw).trim();

    if (!allowedLabels.includes(text)) {
      return t("customField.values.selectInvalidOption", {
        value: text,
        field: fc.label ?? fc.name,
      });
    }

    if (seen.has(text)) {
      return t("customField.values.multiSelectDuplicateOption", {
        value: text,
        field: fc.label ?? fc.name,
      });
    }
    seen.add(text);
  }

  return null;
}

/**
 * Wave 3.3 Batch C: Currency's half of the "prevented, not just 422'd"
 * requirement -- mirrors `CurrencyValueTypeHandler.IsEmpty`/`Validate`'s own
 * two-piece ruling exactly (Task A's own report): "empty" is BOTH the amount
 * and the code missing (not this function's concern -- required-ness is
 * separate, matching every other validator in this file); anything else
 * with exactly ONE piece missing is a genuinely INVALID half-blank
 * submission that would 422 at Validate, so this returns a real,
 * field-named message for it instead of letting a save proceed. A value
 * that isn't the `{ amount, currencyCode }` shape at all (undefined, null,
 * a stray non-object) is treated as fully blank -- defensive, matching
 * `validateSelectCustomFieldValue`'s own "not this function's concern for a
 * type/shape it doesn't recognize" posture.
 */
export function validateCurrencyCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type !== "currency") return null;
  if (value === undefined || value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) return null;

  const { amount, currencyCode } = value as { amount?: unknown; currencyCode?: unknown };
  const amountMissing = amount === undefined || amount === null || amount === "";
  const codeMissing = typeof currencyCode !== "string" || currencyCode.trim() === "";

  // Fully blank -- "nothing to save", not an error. Mirrors
  // CurrencyValueTypeHandler.IsEmpty exactly.
  if (amountMissing && codeMissing) return null;

  if (amountMissing || codeMissing) {
    return t("customField.values.currencyIncomplete", { field: fc.label ?? fc.name });
  }

  return null;
}

/**
 * EntityReference/UserReference's half of the "prevented, not just 422'd"
 * requirement.
 *
 * THE GAP THIS CLOSES. The 8 hand-wired consumer sites do not run GenericForm's
 * required-field pass (they render each field through
 * `renderCustomFieldControl` inside their own sections and validate at save time
 * through `assertSelectCustomFieldValuesValid` below), and that function had arms
 * for currency, select and multi-select and none for entity-reference. So a
 * required reference left blank at any of those 8 sites was submitted blank and
 * refused on a round trip -- and on a CREATE flow refused only after the owner
 * record had already been written.
 *
 * TWO REFUSALS, TWO MESSAGES, mirroring the backend rather than inventing a rule
 * (`EntityReferenceValueTypeHandler`: `IsEmpty` is BOTH pieces blank, `Validate`
 * refuses unless BOTH are present and non-blank):
 *
 *   1. A PARTIALLY filled reference -- anything that is not two non-blank
 *      strings but is not fully blank either. `Validate` answers this with a 422
 *      (`customFields.values.referenceIncomplete`), so it is a genuinely invalid
 *      value regardless of whether the field is required, exactly like Currency's
 *      half-blank case above. Reported as
 *      `customField.entityReference.invalid`, an EXISTING key whose wording is
 *      already precisely this fact ("The reference stored in this field is
 *      malformed and can't be read at all. Choose a record again to replace
 *      it."). Not reachable through the control's own UI -- `handleSelect`
 *      always emits both properties and `handleClear` emits null -- so this
 *      covers stale or tampered form state, which is the same surface
 *      `validateCurrencyCustomFieldValue` exists for.
 *   2. A FULLY blank value on a REQUIRED field. Reported as
 *      `validation.required`, the same core key GenericForm shows for the
 *      identical condition -- one defect, one wording, whichever path the
 *      operator came in by.
 *
 * WHY REQUIRED-NESS IS CHECKED HERE, when every other validator in this file
 * explicitly declines to. Because for those types nothing was lost: a blank
 * Select at a hand-wired site is also submitted blank, but that is a
 * pre-existing, type-independent gap in those 8 sites' own validation, whereas
 * this function is the ONLY client-side gate a reference field has there --
 * `isRequiredFieldEmpty` in generic-form.tsx covers the GenericForm path and
 * nothing covered this one. Deliberately NOT generalised to every type in the
 * same change: widening the required rule to select/multi-select/currency would
 * alter 9 shipped save flows for types that never asked for it, which is a
 * separate decision with its own evidence.
 *
 * A fully blank value on an OPTIONAL field returns null -- "nothing to save", not
 * an error, matching every other validator here and the backend's own `IsEmpty`.
 *
 * @param fc The field being validated; a non-reference type returns null immediately.
 * @param value The effective value about to be submitted.
 * @param t The caller's own `useI18n()` translate function.
 * @returns An already-localized refusal message, or null when the value is submittable.
 */
export function validateEntityReferenceCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type !== "entity-reference") return null;

  // `isEntityReferenceValue` is a SHAPE guard, not a completeness one (see its
  // own doc comment), so a `{ entityTypeKey: "x", entityId: "" }` passes it. The
  // completeness question is asked here, per this caller, exactly as that comment
  // says each caller must.
  const candidate =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as { entityTypeKey?: unknown; entityId?: unknown })
      : null;
  const typeKey = typeof candidate?.entityTypeKey === "string" ? candidate.entityTypeKey.trim() : "";
  const entityId = typeof candidate?.entityId === "string" ? candidate.entityId.trim() : "";

  // Fully blank covers null, undefined, "" and a stray non-object as well as an
  // object with both pieces blank -- all of them mean "no reference here", which
  // is what the backend's IsEmpty means too.
  if (typeKey === "" && entityId === "") {
    return fc.required ? t("validation.required") : null;
  }

  // Exactly one piece present: a value Validate refuses outright.
  if (typeKey === "" || entityId === "") {
    return t("customField.entityReference.invalid");
  }

  return null;
}

/**
 * Thrown by `assertSelectCustomFieldValuesValid` below -- a distinct type so
 * a consumer's save flow can tell "D5 rejected this value client-side, show
 * ITS message" apart from "the actual saveValues API call failed, show the
 * generic customFieldsSaveError toast" in the same catch block, without
 * string-matching or a second try/catch layer.
 */
export class CustomFieldValidationError extends Error {}

/**
 * D5's actual save-flow integration point (final whole-branch review, I3
 * fix). `validateSelectCustomFieldValue` above was correctly built
 * hookless/render-agnostic (its own doc comment explains why the shared
 * EDIT renderer must not auto-call it), but nothing was ever assigned the
 * other half: an actual call from a save flow. That left the function
 * fully tested but with zero production callers, and the round-trip 422 D5
 * exists to prevent still happening unchanged.
 *
 * This is the one place that half belongs: every one of the 8 consumer
 * sites' own save-flow function (`saveCustomFieldValues` / equivalent)
 * already has to loop over `fieldConfigs` to decode names and apply the
 * `"" -> null` default before calling `saveValues` -- see e.g.
 * `useWebhookFormViewModel.ts`. Rather than duplicating a second, slightly
 * different loop in all 8 places, this is the ONE reusable call a save flow
 * makes before that loop: `assertSelectCustomFieldValuesValid(fieldConfigs,
 * values, t)` at the top of `saveCustomFieldValues`, throwing
 * `CustomFieldValidationError` with the first rejected Select field's
 * already-localized message so the flow's own existing catch block can
 * surface it verbatim instead of (or ahead of) the generic
 * "customFieldsSaveError" fallback every site already has.
 *
 * `values[fc.name] ?? fc.defaultValue ?? ""` mirrors every site's own
 * default-value fallback exactly (see useWebhookFormViewModel.ts's
 * `saveCustomFieldValues`) -- this must validate the SAME effective value a
 * site is about to submit, not just what the user actively typed this
 * session, since an untouched field's own stored default can itself be
 * stale (e.g. that field's Options were edited after the value was
 * captured, D5's own named risk).
 *
 * Wired into all 8 consumer sites' save flows (9 flows, since
 * TenantPlanStepCustomFields has separate create/edit viewmodels) -- each
 * calls this as the first statement of its save function, before the
 * decode loop and before saveValues/its equivalent.
 *
 * Wave 3.1 Task 11: the type filter below now also admits "multi-select",
 * so MultiSelect gets the SAME save-flow enforcement Select already has --
 * with ZERO changes to any of the 9 call sites. Every one of them already
 * passes its FULL, unfiltered `fieldConfigs` list here (none of them
 * pre-filter to `type === "select"` themselves -- verified by reading all 9
 * before this change), so widening this one loop's guard is the entire fix;
 * this is the exact "wire it into the real save flows" requirement the D5
 * fix round already paid for once, reused rather than re-paid a second time
 * for the second options-owning type. `values[fc.name] ?? fc.defaultValue ??
 * ""` still needs no change either: an untouched MultiSelect field reads as
 * `""` here, and `validateMultiSelectCustomFieldValue` treats any non-array
 * (including `""`) as an empty selection, not an error.
 *
 * Wave 3.3 Batch C: the loop below now also admits "currency", the same
 * "widen the filter, touch zero call sites" shape Task 11 already used for
 * "multi-select" -- every one of the 9 flows already passes its full,
 * unfiltered fieldConfigs list here. Currency's own default fallback is
 * `null` (not `""`, unlike Select/MultiSelect's string/array-shaped
 * defaults) since its wire value is an object-or-null envelope --
 * `validateCurrencyCustomFieldValue` treats both an untouched field's `null`
 * and a stray non-object the same way: not this function's concern.
 *
 * Wave 4 follow-up: the loop also admits "entity-reference" now, the same
 * "widen the loop, touch zero call sites" shape. It is the one arm that also
 * enforces REQUIRED-ness, and
 * `validateEntityReferenceCustomFieldValue`'s own doc comment explains why that
 * is not an inconsistency: this function is the only client-side gate a
 * reference field has at the 8 hand-wired sites, so without it a required
 * reference left blank was submitted blank and refused on a round trip.
 */
export function assertSelectCustomFieldValuesValid(
  fieldConfigs: FieldConfig[],
  values: Record<string, unknown>,
  t: TranslateFn
): void {
  for (const fc of fieldConfigs) {
    if (fc.type === "currency") {
      const raw = values[fc.name] ?? fc.defaultValue ?? null;
      const error = validateCurrencyCustomFieldValue(fc, raw, t);
      if (error) {
        throw new CustomFieldValidationError(error);
      }
      continue;
    }
    if (fc.type === "entity-reference") {
      // `?? null` like Currency's arm above, not `?? ""`: a reference's wire value
      // is an object-or-null envelope, and `validateEntityReferenceCustomFieldValue`
      // reads null, undefined and a stray non-object all as "fully blank" anyway.
      const raw = values[fc.name] ?? fc.defaultValue ?? null;
      const error = validateEntityReferenceCustomFieldValue(fc, raw, t);
      if (error) {
        throw new CustomFieldValidationError(error);
      }
      continue;
    }
    if (fc.type !== "select" && fc.type !== "multi-select") continue;
    const raw = values[fc.name] ?? fc.defaultValue ?? "";
    const error = validateSelectCustomFieldValue(fc, raw, t);
    if (error) {
      throw new CustomFieldValidationError(error);
    }
  }
}
