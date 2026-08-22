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
 *
 * Task 7b update: `TenantPlanStepCustomFields.tsx`, `TemplateFormView.tsx`
 * and `FeatureDefinitionFormView.tsx` were converted onto this Select branch
 * (closing the D9 divergence named above), and this is also where the T1
 * a11y finding from Task 4's review got resolved -- see the `aria-label`
 * prop on the `GenericSelect` element below, and `generic-select.tsx`'s own
 * doc comment for the full mechanism. The fix is not scoped to these 3
 * sites: it lands here, in the shared branch, so it closes the same latent
 * gap for all 8 consumer sites at once.
 *
 * Wave 3.1 Task 12 update: the LongText and DateTime branches below now
 * delegate to their own dedicated control components
 * (`LongTextCustomFieldControl`/`DateTimeCustomFieldControl`), the same
 * extraction Task 11 already did for MultiSelect -- see those files' own
 * header comments for the counter/zone-disclosure behaviour they own. The
 * Date branch also picked up a real `placeholder`, fixing the accessible
 * name defect the governing pre-plan analysis's §5.4 names explicitly (every
 * Date control was announced as the generic "Select date", not its own
 * field name -- see that branch's own comment below).
 */
import React from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { DatePicker } from "@core/ui/date-picker";
import { Slider } from "@core/ui/slider";
import { PhoneInput } from "@core/ui/phone-input";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import {
  MultiSelectCustomFieldControl,
  MULTI_SELECT_MAX_SELECTIONS,
} from "./MultiSelectCustomFieldControl";
import { LongTextCustomFieldControl } from "./LongTextCustomFieldControl";
import { DateTimeCustomFieldControl } from "./DateTimeCustomFieldControl";
import { CurrencyCustomFieldControl } from "./CurrencyCustomFieldControl";
import { DurationCustomFieldControl } from "./DurationCustomFieldControl";
import { EntityReferenceCustomFieldControl } from "./EntityReferenceCustomFieldControl";
import {
  isEntityReferenceValue,
  type CustomFieldEntityReferenceValue,
} from "../../../custom-field-value/src/data/models/CustomFieldValueModel";
import { ColorPickerField } from "@core/ui/rich-text-editor/ColorPickerField";
import { RATING_MIN, RATING_MAX } from "./valueTypeRegistry";

export interface CustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  /** D9: FeatureDefinitionFormView.tsx needs this from day one, not bolted on later. */
  isViewMode?: boolean;
  /**
   * The HOST form's own validation verdict for this field, for controls that can
   * surface one. Added for `GenericFormCustomFieldControl`, the bridge that lets a
   * plain `<GenericForm>` draw a custom field through
   * `CustomFieldsExtensionApi.FieldControl`: GenericForm holds an `errors` map and
   * renders its own error node, and a control that ignored that would drop the
   * `aria-invalid` its sibling branches all set.
   *
   * Optional, so all 8 hand-wired consumer sites keep compiling and behaving
   * exactly as before — none of them has a per-field validation verdict to pass
   * (they validate at save time through `assertSelectCustomFieldValuesValid`
   * below, not per field). Read by the three branches whose controls accept it —
   * reference, currency and duration, i.e. exactly the types GenericForm draws
   * through this dispatcher; a branch that cannot honour it silently ignoring it
   * is better than a prop it pretends to support.
   */
  invalid?: boolean;
  /**
   * Id of the hint/error node the HOST rendered below this field, for
   * `aria-describedby`. Same origin and same optionality as `invalid` above.
   * Every branch that reads it COMPOSES rather than overwrites it
   * (`aria-describedby` takes an id list), so the host's message and the
   * control's own note are both announced: `EntityReferenceCustomFieldControl`
   * appends its resolution note, `CurrencyCustomFieldControl` its pairing hint,
   * `DurationCustomFieldControl` its minutes unit.
   */
  describedBy?: string;
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
  invalid,
  describedBy,
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
          // Wave 3.1 Task 12 fix (pre-plan analysis §5.4): DatePicker computes
          // its OWN internal `aria-label` as `placeholder || t("common.selectDate")`
          // (date-picker.tsx) -- with no `placeholder` passed, every Date
          // control in the product was announced as the generic "Select
          // date", never its own field name. `<Label htmlFor>` above cannot
          // fix this itself: it binds only to the hidden `aria-hidden`
          // native input DatePicker renders for `fireEvent`/form-submission
          // purposes, not to the visible `role="combobox"` trigger a screen
          // reader actually names -- the exact "test that cannot fail"
          // §5.4 traces (`getByLabelText` resolves the hidden input
          // regardless of `aria-hidden`, so the old test passed even though
          // the real announced name was wrong; this file's own test now
          // asserts the name via `getByRole` instead). `fc.placeholder ||
          // fc.label || fc.name` mirrors the Select branch's own
          // `fc.placeholder || fc.label` fallback above, with the same
          // `?? fc.name` safety net `aria-label={fc.label ?? fc.name}`
          // already uses there for a definition with no label at all.
          placeholder={fc.placeholder || fc.label || fc.name}
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
          // Wave 2 Step 2.2, Task 7b's a11y fix (tracked as finding T1 in
          // Task 4's review): the <Label htmlFor={fc.name}> above never
          // computed an accessible name for this control -- GenericSelect's
          // trigger is a role="combobox" `<div>`, not a labelable HTML
          // element, so `for`/`htmlFor` association is a no-op for it. That
          // was a pre-existing, NOT-worsened gap for the 5 sites already
          // wired to this branch (none of them passed `id` before Task 4
          // either, so they had no association to lose). It would have been
          // a REAL regression for the 3 raw-Radix-`Select` sites Task 7b
          // converts onto this branch: their old `<button>` trigger WAS
          // labelable, so their `<Label htmlFor>` genuinely worked pre-
          // conversion. `aria-label` (now a first-class GenericSelect prop,
          // see generic-select.tsx) closes the gap for all 8 consumer sites
          // at once, not just these 3. Falls back to `fc.name` the same way
          // validateSelectCustomFieldValue does below (`fc.label ?? fc.name`)
          // -- FieldConfig["label"] is optional, and an undefined aria-label
          // would silently self-revert this exact fix for that one field,
          // with no error and no test failure unless a test specifically
          // constructs a labelless FieldConfig (Task 7b review, M2).
          aria-label={fc.label ?? fc.name}
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

  // Wave 3.1 Task 12: LongText's real control -- a visible character counter
  // (throttled aria-live announcement, no maxLength) against the server's
  // 10,000-char cap, plus the dir/resize polish Task 10 explicitly deferred.
  // Extracted into its own component (LongTextCustomFieldControl.tsx) rather
  // than inlined here, the same way MultiSelect (Task 11) and DateTime
  // (below) own real state-derived behaviour a plain `if` branch can't hold
  // -- see that file's own header comment for the full design.
  if (fc.type === "textarea") {
    return (
      <LongTextCustomFieldControl
        key={fc.name}
        fc={fc}
        value={value}
        onChange={onChange}
        isViewMode={isViewMode}
      />
    );
  }

  // Wave 3.1 Task 10 fixed the dispatch-correctness defect the pre-plan
  // analysis's §5.2/TRAP 11 names explicitly (the Select branch's own
  // `toFieldInputValue` -- `String(value)` -- would have turned an array
  // into the single string "a,b", which `GenericSelect`'s own
  // `Array.isArray(value)` multi-detection would never recognize as a
  // selection). Wave 3.1 Task 11 replaces that minimal branch with the real
  // control: ceiling enforcement (19 selections, MULTI_SELECT_MAX_SELECTIONS
  // below), a live selection counter, and the WAI-ARIA listbox pattern --
  // see MultiSelectCustomFieldControl.tsx's own header comment for the full
  // design. `onChange` is typed `(value: unknown) => void` on this shared
  // renderer, so it accepts the control's `string[]` callback with no cast.
  if (fc.type === "multi-select") {
    return (
      <MultiSelectCustomFieldControl
        key={fc.name}
        fc={fc}
        value={value}
        onChange={onChange}
        isViewMode={isViewMode}
      />
    );
  }

  // Wave 3.1 Task 12: DateTime's real control -- the visible "resolved zone"
  // disclosure plus its searchable-combobox "change" affordance Task 10
  // explicitly deferred (its own report: "this intentionally does NOT
  // render the resolved zone text or a change affordance"). Extracted into
  // its own component (DateTimeCustomFieldControl.tsx) for the same reason
  // as LongText/MultiSelect -- see that file's own header comment for how it
  // structurally prevents a half-filled `{ value, timeZoneId }` submission
  // (ruling R7) from ever being composed through the UI.
  if (fc.type === "datetime") {
    return (
      <DateTimeCustomFieldControl
        key={fc.name}
        fc={fc}
        value={value}
        onChange={onChange}
        isViewMode={isViewMode}
      />
    );
  }

  // Wave 3.2 Batch 3 (trap #1, verified): the shared Input fallthrough at the
  // bottom of this function only special-cases "number" -- everything else,
  // INCLUDING "email"/"tel"/"url", silently renders `type="text"`. That is
  // invisible when testing only through GenericForm (its own switch already
  // maps `email`/`tel`/`url` onto the right native `type` -- see
  // generic-form.tsx), but every one of the 8-9 CustomFields consumer sites
  // renders through THIS function, not GenericForm, so each of these three
  // needs its own explicit branch here. Email's write surface is a plain
  // `type="email"` input -- EmailValueTypeHandler's own validation
  // (MailAddress parsing) is server-side; this control does not duplicate
  // that logic, only gives the browser's own email affordances (keyboard on
  // mobile, basic format hinting) a chance to run.
  if (fc.type === "email") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label ?? fc.name}
        </Label>
        <Input
          id={fc.name}
          type="email"
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

  // Url's write surface is likewise a plain `type="url"` input. R4's actual
  // security boundary (the http/https scheme allowlist) is enforced
  // server-side at write time by UrlValueTypeHandler -- this control does not
  // duplicate that check, it only gets the browser's own URL-shape hinting.
  // The read side (formatCustomFieldValue.tsx's "Url" case) is the one that
  // must not blindly trust a stored value -- see that case's own comment.
  if (fc.type === "url") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label ?? fc.name}
        </Label>
        <Input
          id={fc.name}
          type="url"
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

  // Phone wires the existing, mature `core/ui/phone-input.tsx` (libphonenumber,
  // flags, country search, RTL, en/ar locale tables) into the CustomFields
  // family for the first time (R3/R6) -- no new component was built. `id`
  // passed here genuinely reaches the real underlying `<input>` element (not
  // just the composite's outer `<div>`): traced through
  // react-phone-number-input's own source
  // (PhoneInputWithCountry.js's `_excluded` destructure list omits "id", so
  // it survives into `rest`, which is spread onto the library's
  // `InputComponent` -- our own `PhoneInputComponent` in phone-input.tsx
  // spreads that straight onto a real `<input>`). So `<Label htmlFor={fc.name}>`
  // DOES compute a real accessible name here, unlike GenericSelect's
  // `role="combobox"` div -- verified with `getByRole("textbox", { name })`
  // in this file's own test, per the "verify, don't trust getByLabelText"
  // discipline Wave 3.1 Task 11 established for exactly this class of claim.
  if (fc.type === "tel") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label ?? fc.name}
        </Label>
        <PhoneInput
          id={fc.name}
          value={toFieldInputValue(value)}
          onChange={(v) => onChange(v)}
          disabled={isViewMode}
        />
      </div>
    );
  }

  // Rating's real control (R2/R6): a discrete Radix Slider, min 1 / max 5 /
  // step 1 -- RATING_MIN/RATING_MAX above, code-owned constants mirroring
  // RatingValueTypeHandler's own hardcoded ceiling, not a per-field config
  // knob. No new component was built (reuses `@core/ui/slider.tsx` directly,
  // the same primitive GenericForm's own "slider" branch already wires up).
  //
  // ACCESSIBLE NAME -- a real bug found and fixed, not assumed away: the
  // governing pre-plan analysis's R7 claimed "Rating's Radix slider thumb is
  // a real focusable, labelable element" (implying `<Label htmlFor>` would
  // work here the way it does for a plain `<input>`). Tracing Radix's own
  // source (@radix-ui/react-slider) disproves that: `id` passed to `Slider`
  // lands on the ROOT `<span>` (via `...sliderProps` in the library's
  // `Slider` component), never on the Thumb -- and the Thumb (the actual
  // `role="slider"` element a screen reader focuses) computes its accessible
  // name from ITS OWN `aria-label` prop, falling back to a generic
  // library-default "Value" label if none is given. `@core/ui/slider.tsx`
  // did not forward an `aria-label` to the Thumb at all before this batch, so
  // every Slider in the app (not just this one) had NO real per-instance
  // accessible name. Fixed at the shared primitive (`core/ui/slider.tsx`),
  // the same "close the gap once, at the shared component, for every
  // consumer" shape Wave 2 Step 2.2 Task 7b used for GenericSelect's
  // `aria-label` fix -- see that file's own comment. Verified here (not
  // assumed) via `getByRole("slider", { name })` in this file's own test AND
  // a dedicated `core/ui/slider.test.tsx`.
  //
  // EMPTY/UNSET DISPLAY: a Radix Slider always needs a real number to
  // position its thumb -- there is no "no selection yet" visual state for a
  // slider (the same inherent limitation GenericForm's own "slider" branch
  // already has, defaulting to `field.min ?? 0`). An untouched/empty Rating
  // field is shown at RATING_MIN (1), matching that existing convention --
  // it does NOT mean "rated 1", only "nothing dragged yet"; onChange is never
  // called until the user actually moves the thumb, so an untouched field
  // still submits as empty (IsEmpty), never a false "1".
  if (fc.type === "slider") {
    const numericValue =
      typeof value === "number" && Number.isFinite(value) ? value : RATING_MIN;
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label}
        </Label>
        <Slider
          id={fc.name}
          aria-label={fc.label ?? fc.name}
          value={[numericValue]}
          onValueChange={(v) => onChange(v[0])}
          min={RATING_MIN}
          max={RATING_MAX}
          step={1}
          disabled={isViewMode}
          className="w-full"
        />
        <div className="flex items-baseline justify-between text-xs text-nx-ink-3">
          <span>{fc.label}</span>
          <span className="font-medium tabular-nums text-nx-ink-2">
            {numericValue} / {RATING_MAX}
          </span>
        </div>
      </div>
    );
  }

  // Wave 3.3 Batch C: Currency's real control (rulings R1/R2) -- a paired
  // amount + ISO 4217 code composite, structured exactly like DateTime's own
  // `{ value, timeZoneId }` two-piece control (neither Currency piece is
  // meaningful alone, per CurrencyValueTypeHandler.IsEmpty's own "empty only
  // when BOTH are missing" ruling). Dispatched on a genuinely new
  // `"currency"` FieldConfig["type"] rather than the backend Descriptor's
  // reused `"number"` string -- see CurrencyCustomFieldControl.tsx's own
  // header comment for why that backend string is not a frontend dispatch
  // contract at all (nothing on the wire carries it).
  //
  // `invalid`/`describedBy` are forwarded (Wave 4 follow-up): GenericForm now
  // draws Currency through this dispatcher, and it owns the errors map and the
  // hint/error node -- a control that dropped them would render a red error
  // paragraph no screen reader ever associates with either input.
  if (fc.type === "currency") {
    return (
      <CurrencyCustomFieldControl
        key={fc.name}
        fc={fc}
        value={value}
        onChange={onChange}
        isViewMode={isViewMode}
        invalid={invalid}
        describedBy={describedBy}
      />
    );
  }

  // Wave 3.3 Batch C: Duration's real control (ruling R4) -- a plain minutes
  // number input with an explicit, localized unit annotation next to it, so
  // a bare stored `90` is never ambiguous about its unit the way PD-2 was
  // decided to avoid for Percent. See DurationCustomFieldControl.tsx's own
  // header comment for why this needs a dedicated `"duration"` dispatch key
  // (not reused "number") and why it needs a real component at all (the
  // localized unit label requires useI18n(), which this hookless function
  // cannot call itself).
  // `invalid`/`describedBy` forwarded for the same reason as Currency's branch
  // above -- both types are drawn by GenericForm through this dispatcher now.
  if (fc.type === "duration") {
    return (
      <DurationCustomFieldControl
        key={fc.name}
        fc={fc}
        value={value}
        onChange={onChange}
        isViewMode={isViewMode}
        invalid={invalid}
        describedBy={describedBy}
      />
    );
  }

  // Wave 3.3 Batch C: Time's real control (R6 -- the trap this batch exists
  // to close). `"time"` is declared in FieldConfig["type"] (generic-form.tsx)
  // but GenericForm itself routes it to DatePicker via an `as any` cast onto
  // a `type` prop that only ever declares "date" | "datetime-local" -- an
  // untested, effectively-undefined rendering path. That trap is irrelevant
  // to CustomFields specifically (every consumer site calls this function
  // directly, never <GenericForm>), but the pre-plan analysis's own R6 still
  // asks for a REAL control here rather than silently falling through this
  // file's shared text/number Input fallthrough (which would render
  // type="text" -- no native time UI, no HH:mm:ss affordance at all).
  //
  // A real, working `<input type="time">` already exists in this codebase
  // (custom-calendar.tsx:948-953), embedded un-exported inside
  // CustomCalendar's own datetime-local time sub-picker -- but it is tightly
  // coupled to THAT component's own combined date+time state
  // (selectedTime/handleTimeChange) and its own one-off `timeInputStyles`
  // constant, not a general-purpose control. Exporting and reusing it as-is
  // would import DateTime-picker-specific coupling into a field that has no
  // date component at all. Instead: reuse this file's own shared `Input`
  // primitive (the SAME field surface Email/Url/Tel above already ride) with
  // `type="time"` -- `Input`'s own `NUMERIC_INPUT_TYPES` set
  // (core/ui/input.tsx) already lists `"time"` for tabular-figure styling,
  // so this is not a new/foreign shape for that component, just its first
  // CustomFields caller. This satisfies "build a small control" (R6's own
  // wording) without duplicating custom-calendar.tsx's inline JSX a second
  // time anywhere.
  //
  // `step={1}` turns on the native seconds field so the control can express
  // (and, once the user picks a time, always emits) the canonical
  // `HH:mm:ss` shape TimeValueTypeHandler stores -- without it, a native
  // time input only round-trips `HH:mm`, silently dropping seconds. Zero
  // padding is guaranteed by the native widget itself, not this code.
  if (fc.type === "time") {
    return (
      <div key={fc.name} className="space-y-2">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label ?? fc.name}
        </Label>
        <Input
          id={fc.name}
          type="time"
          step={1}
          value={toFieldInputValue(value)}
          onChange={(e) => onChange(e.target.value)}
          required={fc.required}
          disabled={isViewMode}
          className="text-sm"
        />
      </div>
    );
  }

  // Wave 3.3 Batch C: Color's real control (ruling R5). `"color"` is already
  // declared in both FieldConfig["type"] and the backend's
  // KnownFieldConfigTypes, but nothing branches on it here yet -- it falls
  // through to this file's shared Input fallthrough below, which renders
  // `type={fc.type === "number" ? "number" : "text"}`, i.e. a bare TEXT
  // input with no hex entry, no swatches, and no relationship at all to the
  // stored `#rrggbb`/`#rgb` value. `core/ui/rich-text-editor/ColorPickerField.tsx`
  // is a real, mature, already-accessible 20-swatch-plus-hex-entry picker
  // that R5 names as CustomFields' intended home for this type -- reused
  // here via its new `i18nKeyPrefix` prop (`"customField.color"`) so this
  // module's own translations resolve instead of leaking the rich-text-
  // editor's `editorBlocks.color.*` keys into a namespace that does not own
  // them. Its own label trap is already solved (`aria-labelledby` binding
  // the trigger to both the field-name label and the live hex-value text,
  // not `<Label htmlFor>`) -- verified by reading that file directly, not
  // re-solved here.
  if (fc.type === "color") {
    return (
      <ColorPickerField
        key={fc.name}
        label={fc.label ?? fc.name}
        value={typeof value === "string" && value ? value : "#000000"}
        onChange={(color) => onChange(color)}
        disabled={isViewMode}
        i18nKeyPrefix="customField.color"
      />
    );
  }

  // Wave 4: EntityReference/UserReference's real control -- a paged,
  // debounced server-search picker whose stored value is a two-piece
  // `{ entityTypeKey, entityId }` envelope and whose display name is NOT in
  // that envelope (it is resolved live, permission-checked, on every render;
  // see EntityReferenceCustomFieldControl.tsx's own header for why a
  // snapshotted name is refused). Both value types dispatch here: they differ
  // only in which target key is offered, which is data, not a control kind.
  //
  // PROPS, NOT `{ fc, value, onChange, isViewMode }`. This is the first branch
  // that does not hand the whole FieldConfig to its component, and that is on
  // purpose rather than drift: this control's contract is a fixed, narrow prop
  // set (id / label / targetEntityTypeKey / value / onChange / required /
  // disabled / invalid / describedBy / placeholder) shared with a second
  // consumer surface, so it takes the pieces it needs instead of a form-layer
  // object it would have to know how to read. The mapping is done here, once.
  //
  // `disabled={isViewMode}`, NOT `readOnly`. This file's own header records the
  // split it reproduces from FeatureDefinitionFormView.tsx: Switch takes
  // `readOnly` (blocks the change, keeps focus and live colours), while every
  // picker/input family control -- Input, DatePicker, GenericSelect -- takes
  // `disabled`. A reference picker is a picker, so it follows Select's
  // precedent. (The control itself DOES use `readOnly` internally for its own
  // 403 state, which is a different question: "you may not read the target's
  // name" is not "this form is in view mode".)
  //
  // `invalid`/`describedBy` are NOT passed, matching every other branch here:
  // this renderer has no per-field error channel at all -- error text is owned
  // by each consumer site's own form layout, and no branch in this file
  // receives or forwards one. Wiring only this one control to props nothing
  // supplies would be dead parameter-passing that reads as though errors were
  // handled here.
  //
  // TARGET TYPE: THE DEFINITION'S PIN FIRST, THE STORED VALUE'S OWN KEY
  // SECOND. Both sources are real and both are needed; the ORDER is the whole
  // decision, so it is spelled out here rather than left to be inferred.
  //
  // What each source means:
  //   * `fc.referenceTargetEntityTypeKey` (CustomField.ReferenceTargetEntityTypeKey, resolved
  //     server-side by `IValueTypeHandlerRegistry.ResolveTargetEntityType` and carried here through
  //     `mapValueToFieldConfig`) is what a NEW pick MAY point at. It is the definition's current
  //     configuration, so it is the only source that can answer for an EMPTY field.
  //   * `reference.entityTypeKey` is what THIS value DOES point at -- durable per-value data the
  //     backend stores precisely so a historical reference stays interpretable after its definition
  //     is re-pointed.
  //
  // WHY THE PIN WINS. This prop feeds the SEARCH only; the held value's display name is resolved off
  // `value` inside the control, never off this prop (verified in
  // EntityReferenceCustomFieldControl.tsx -- `useEntityLookupSearch({ entityTypeKey:
  // targetEntityTypeKey })` vs `useResolveEntityReference(value)`). So preferring the pin costs
  // nothing on the read side: a value pointing at the old type still renders its real name. Getting
  // this backwards is what costs something -- a field re-pointed from `hrms.staff-member` to
  // `identity.user` would keep offering staff members to anyone editing a record that still holds an
  // old value, i.e. the picker would quietly disagree with the definition and every new pick made
  // through it would be one the write-side gate then refuses.
  //
  // WHY THE VALUE FALLBACK SURVIVES. An unpinned EntityReference is not a misconfiguration: any
  // registered entity type is a legal target, so the definition genuinely has no single answer to
  // report (`EntityReferenceValueTypeHandler.ImplicitTargetEntityTypeKey` is null and its doc
  // comment says so). For those fields the value is the only source there is, and dropping the
  // fallback would take a populated, perfectly operable reference and disable its picker.
  //
  // WITH NEITHER SOURCE the control gets `null` and renders its explicit, localized "no target
  // entity type configured" state -- deliberately NOT an empty dropdown, which reads as "the server
  // has no records" and sends whoever hits it looking in the wrong place entirely.
  //
  // USERREFERENCE NEEDS NO SPECIAL CASE, and must not be given one. Its target is fixed at
  // `identity.user` by a code-owned allowlist, and the server already reports that through the pin
  // for unpinned UserReference fields too (`UserReferenceValueTypeHandler.ImplicitTargetEntityTypeKey`
  // derives it from `AllowedTargetKeys`), which is exactly why the pin is delivered on the same
  // property at the same resolution as a real EntityReference pin. Restating `identity.user` here
  // would duplicate a backend allowlist this layer cannot see -- and it is not even expressible:
  // both value types share `fieldConfigType: "entity-reference"`, so this branch cannot tell them
  // apart. If the pin is absent (a server predating it), UserReference degrades to the value
  // fallback like everything else; it never depends on the pin being configured by an admin.
  if (fc.type === "entity-reference") {
    const reference: CustomFieldEntityReferenceValue | null = isEntityReferenceValue(value)
      ? value
      : null;
    // `.trim() || null` rather than `?? null`: null, undefined, "" and a
    // whitespace-only pin all have to collapse to "no pin" so they fall
    // through to the value. Whitespace is not hypothetical padding on the
    // check -- the control's own `hasTarget` guard already refuses a
    // whitespace key (a picker opened against " " would query a route the
    // server cannot resolve), and a pin that reaches THERE as whitespace has
    // already lost the value's usable key on the way past this line.
    const pinnedTarget = fc.referenceTargetEntityTypeKey?.trim() || null;
    // No wrapping <Label> here, unlike the inline branches above: this control
    // renders its own label/control pair (it has to -- its accessible name
    // comes from `aria-label`, since the trigger is a role="combobox" div that
    // `<Label htmlFor>` alone cannot name), so adding one would duplicate it.
    // Same shape as the textarea/multi-select/datetime/currency/duration
    // branches, all of which delegate the whole field.
    return (
      <EntityReferenceCustomFieldControl
        key={fc.name}
        id={fc.name}
        label={fc.label ?? fc.name}
        targetEntityTypeKey={pinnedTarget ?? reference?.entityTypeKey ?? null}
        value={reference}
        onChange={(next) => onChange(next)}
        required={fc.required}
        disabled={isViewMode}
        placeholder={fc.placeholder}
        // Forwarded so a HOST form's own validation verdict and hint/error node
        // reach the control. Undefined at all 8 hand-wired sites (they validate
        // at save time, not per field), which is exactly the control's existing
        // behaviour: its `invalid || status === "invalid"` and its describedBy
        // composition both already handle an absent caller value.
        invalid={invalid}
        describedBy={describedBy}
      />
    );
  }

  // Wave 3.2 Batch 3: Percent (fieldConfigType "number") is DELIBERATELY NOT
  // given its own branch above -- PercentValueTypeHandler's own Batch 2
  // report: "Percent's write surface is honestly just a numeric input
  // constrained 0-100 by Validate -- the same shape Number already renders
  // through." This shared fallthrough already special-cases "number" (the
  // ternary below), so Percent gets a real, correct `type="number"` input for
  // free via the exact code path Number itself already exercises and tests
  // cover -- adding a second, textually-separate branch that produces
  // identical DOM would be duplication, not a fix. Percent's read-side DOES
  // still need its own case (formatCustomFieldValue.tsx, R5's `%`-suffix
  // fix), since that dispatch is keyed on valueType, not fieldConfigType.
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
