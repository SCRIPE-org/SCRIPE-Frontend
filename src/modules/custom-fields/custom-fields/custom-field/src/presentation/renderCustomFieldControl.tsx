"use client";

/**
 * Shared per-type EDIT control renderer -- Wave 2 Step 2.2, Tasks 2-4.
 *
 * Ports the Text/Number/Boolean/Date/Select branches of the identical switch
 * statement duplicated across 8 consumer sites (WebhookFormCustomFieldsSection.tsx,
 * CreateLeadCustomFieldsSection.tsx, FeatureDefinitionFormView.tsx and 5
 * siblings) into ONE function every site will call starting Task 7. All 5
 * FieldConfig["type"] kinds this catalog produces (switch/date/select, plus
 * the number/text fallthrough) are now handled -- Text/Number/Boolean landed
 * in Task 2, Date in Task 3, Select (the most complex branch -- it's the only
 * type whose editing also needs client-side validation, see
 * validateSelectCustomFieldValue below) in Task 4.
 *
 * Cross-checked byte-for-byte against WebhookFormCustomFieldsSection.tsx and
 * CreateLeadCustomFieldsSection.tsx before porting: both sites' Text/Number
 * (fallthrough Input branch) and Boolean (Switch branch) JSX are identical
 * (same className, same prop set, same toFieldInputValue helper) modulo the
 * update-callback identifier name (`vm.updateCustomFieldValue` vs
 * `onCustomFieldChange`), which this shared renderer already abstracts away
 * via the `onChange` prop. No drift found between the two sites for these 3
 * types. The Select branch is ported from WebhookFormCustomFieldsSection.tsx
 * specifically (not the 3 divergent sites' raw-Radix-`Select` version) per the
 * governing pre-plan analysis's D9 ruling: `GenericSelect` is the majority
 * pattern (5 of 8 sites -- WebhookFormCustomFieldsSection.tsx,
 * CreateLeadCustomFieldsSection.tsx, DefinitionFormCustomFieldsSection.tsx,
 * SubmitDsrModal.tsx, SaveAsThemeModal.tsx) with better a11y/keyboard
 * behavior, and the OTHER 3 sites' raw `Select` (from `@core/ui/select`, not
 * `GenericSelect`) -- `TenantPlanStepCustomFields.tsx`, `TemplateFormView.tsx`,
 * `FeatureDefinitionFormView.tsx` (also named E3/E6/E8 in the pre-plan
 * analysis's own D9 section) -- get converted onto `GenericSelect` in Task 7
 * rather than this renderer preserving their divergence. Re-verified directly
 * against all 8 sites' real source for this task (not just the pre-plan
 * analysis's own count) after an earlier draft of this comment undercounted
 * it as "2 raw-Select sites" and dropped `TenantPlanStepCustomFields.tsx`.
 *
 * Placed flat in presentation/ (no `registry/` subfolder), matching Task 1's
 * valueTypeRegistry.ts -- this codebase has no `presentation/registry/`
 * convention anywhere (see that file's own header comment for the precedent
 * survey: subscriptions' constants.ts, signin's layouts/index.ts, settings'
 * settings-nav.tsx).
 */
import React from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { DatePicker } from "@core/ui/date-picker";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { FieldConfig } from "@core/ui/forms/generic-form";

export interface CustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  /** D9: FeatureDefinitionFormView.tsx needs this from day one, not bolted on later. */
  isViewMode?: boolean;
}

/** Ported verbatim from the 8 duplicated consumer sites' own toFieldInputValue helper. */
function toFieldInputValue(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

/**
 * The shared per-type edit control every consumer site (WebhookFormCustomFieldsSection.tsx
 * and 7 siblings) calls instead of hand-rolling its own switch (Wave 2 Step 2.2, D3). Keyed
 * on FieldConfig["type"], the vocabulary every site already receives via
 * customFieldsCrudIntegration.tsx's VALUE_TYPE_TO_FIELD_TYPE -- see the governing pre-plan
 * analysis for why this key was chosen over the raw CustomFieldValueTypeName.
 *
 * isViewMode's mechanism is NOT the same for both control families, and this function
 * reproduces FeatureDefinitionFormView.tsx's real, already-shipped behavior rather than a
 * uniform-looking guess (re-verified against @core/ui/switch.tsx and @core/ui/input.tsx
 * source, and against every isViewMode usage in FeatureDefinitionFormView.tsx itself,
 * including its own custom-field-loop Switch/Input branches):
 *  - Switch -> `readOnly` (NOT `disabled`). switch.tsx defines `readOnly` as a first-class
 *    prop distinct from `disabled`: it blocks the change while keeping the control focusable
 *    and its live colours ("Not the same as `disabled`" per that prop's own doc comment).
 *    FeatureDefinitionFormView.tsx's Status Switch and its custom-field Switch branch both
 *    use `readOnly={isViewMode}`.
 *  - Input (text/number fallthrough) -> `disabled` (NOT `readOnly`). Every Input instance in
 *    FeatureDefinitionFormView.tsx, including its own custom-field Input branch, uses
 *    `disabled={isViewMode}`. (Input does genuinely support a styled `readOnly` -- see
 *    input.tsx's READ_ONLY_FIELD -- but that is not the mechanism this reference site uses.)
 *  - GenericSelect (Select) -> `disabled` (NOT `readOnly`), same family as Input/DatePicker.
 *    `GenericSelect` genuinely supports BOTH a `disabled` and a distinct `readOnly` prop (see
 *    generic-select.tsx's own prop doc comments -- `readOnly` there means "readable value, no
 *    picker, no grey slab. NOT the same as `disabled`", the same distinction Switch makes) --
 *    so this is a real choice, not the only option. FeatureDefinitionFormView.tsx's own
 *    custom-field Select branch (pre-Task-4, raw Radix `Select`) uses `disabled={isViewMode}`,
 *    not `readOnly` -- confirmed against that file's real source before writing this branch --
 *    so `disabled` reproduces its actual shipped behavior, and keeps Select consistent with
 *    every other non-Switch control in this file.
 */
export function renderCustomFieldControl({
  fc,
  value,
  onChange,
  isViewMode,
}: CustomFieldControlProps): React.ReactNode {
  if (fc.type === "switch") {
    return (
      <div key={fc.name} className="flex items-center justify-between">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label}
        </Label>
        <Switch
          id={fc.name}
          checked={Boolean(value)}
          onCheckedChange={(v) => onChange(v)}
          readOnly={isViewMode}
        />
      </div>
    );
  }

  if (fc.type === "date") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label}
        </Label>
        <DatePicker
          id={fc.name}
          type="date"
          value={toFieldInputValue(value)}
          onChange={(v) => onChange(v)}
          required={fc.required}
          disabled={isViewMode}
        />
      </div>
    );
  }

  if (fc.type === "select") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label}
        </Label>
        <GenericSelect
          // Not in WebhookFormCustomFieldsSection.tsx's own verbatim source (it
          // omits `id`, so its <Label htmlFor> never actually binds to anything).
          // GenericSelect's own prop doc comment says `id` "[l]ands on the
          // role=\"combobox\" element so <Label htmlFor> binds to it" -- exactly
          // what every other branch in this file already does (Switch/DatePicker/
          // Input all pass `id={fc.name}`), so this fixes that latent a11y gap
          // rather than porting it forward.
          id={fc.name}
          options={fc.options?.map((opt) => ({ value: opt.value, label: opt.label })) ?? []}
          value={toFieldInputValue(value)}
          onValueChange={(v: string | string[]) => {
            // D6: `v` is a GenericSelectOption.value from the `options` array
            // built two lines above, and mapValueToFieldConfig
            // (customFieldsCrudIntegration.tsx) always constructs each option as
            // `{ value: o, label: o }` -- the SAME raw option string on both
            // sides, never a synthetic id. So `v` here already IS the option's
            // label text. This must stay true: the backend's
            // SelectValueTypeHandler.Validate resolves a submitted Select value
            // by an ordinal, case-sensitive match against CustomField.Options
            // (the label strings) -- sending an id instead of the label would
            // pass validation here but silently fail (422) on save, at a point
            // far from the actual mistake.
            onChange(v);
          }}
          placeholder={fc.placeholder || fc.label}
          type="single"
          required={fc.required}
          disabled={isViewMode}
        />
      </div>
    );
  }

  return (
    <div key={fc.name} className="space-y-2">
      <Label htmlFor={fc.name} className="text-sm font-medium">
        {fc.label}
      </Label>
      <Input
        id={fc.name}
        type={fc.type === "number" ? "number" : "text"}
        value={toFieldInputValue(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fc.placeholder}
        required={fc.required}
        disabled={isViewMode}
        className="text-sm"
      />
    </div>
  );
}

/** Matches useI18n()'s own `t` signature (i18n-provider.tsx) without importing the provider. */
export type TranslateFn = (key: string, params?: Record<string, unknown>) => string;

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
 * "select" at all, and the (already-interpolated) error message string
 * otherwise. Whitespace-only ("   ") is deliberately treated the SAME as
 * fully-empty, not as "not one of the allowed options": the backend's
 * `SelectValueTypeHandler.IsEmpty` is `string.IsNullOrWhiteSpace`-based and is
 * checked BEFORE `Validate` ever runs (see
 * `SaveEntityCustomFieldValuesCommandHandler.cs`'s empty-value gate, and Wave
 * 2 Step 2.1's own D35 ruling) -- so the backend would accept a whitespace-
 * only submission as "clear this value," never reject it as invalid. Checking
 * membership before the blank check would make this function reject a value
 * the backend happily treats as empty, the exact kind of frontend/backend
 * verdict mismatch D5 exists to eliminate, not reintroduce.
 *
 * NOT called automatically from the Select branch above. `GenericSelect` only
 * ever emits a value drawn from that branch's own `options` array (built from
 * `fc.options`), so a value reaching `onChange` through the picker UI can
 * never be out-of-list -- gating `onChange` itself would be dead defensive
 * code with no real attack surface via the UI. The actual risk this closes is
 * a STALE value already sitting in form state reaching a save/submit flow
 * (e.g. a field's `Options` were edited after this value was captured) --
 * exactly the case the backend's own 422 exists for today, and exactly what a
 * consumer should check before calling its save API, not on every keystroke.
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
 */
export function validateSelectCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
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
