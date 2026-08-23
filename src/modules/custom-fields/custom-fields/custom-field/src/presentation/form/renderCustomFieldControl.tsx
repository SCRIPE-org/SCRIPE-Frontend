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
 * validateSelectCustomFieldValue in customFieldValueValidation.ts) in Task 4.
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
 * Lives in `presentation/form/`, beside the other pieces a host form needs to draw
 * and submit a custom field (`GenericFormCustomFieldControl`, `formatCustomFieldValue`,
 * the two field-config builders, and the validation half this file was split from).
 * The value-type catalogs it reads are pure data and live one folder over in
 * `presentation/registries/`; the per-type controls it dispatches to are in
 * `presentation/controls/`. External consumers reach none of these paths directly --
 * they import from the submodule barrel, which is what lets this layout change without
 * touching them.
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
 *
 * Wave 3.4 update: three more branches, and all three are here for the same
 * reason rather than for widget variety -- their VALUE SHAPE. `"media-file"`,
 * `"media-image"` and `"rich-text"` are new `FieldConfig["type"]` members even
 * though `"file"`, `"image"` and `"richtext"` already existed, because each of
 * those three pre-existing members is drawn by GenericForm's own switch through
 * a control that produces a shape the backend refuses for these types (a browser
 * `File`, a base64 string, and a bare string respectively). That is the same
 * defect class Wave 4 fixed for `"entity-reference"`, avoided in advance rather
 * than after the fact. Media's two branches share one control and differ only in
 * `imagesOnly`; RichText's branch narrows `unknown` to the `{ html }` envelope
 * its control wraps and unwraps.
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
import { MultiSelectCustomFieldControl } from "../controls/MultiSelect/MultiSelectCustomFieldControl";
import { LongTextCustomFieldControl } from "../controls/LongText/LongTextCustomFieldControl";
import { DateTimeCustomFieldControl } from "../controls/DateTime/DateTimeCustomFieldControl";
import { CurrencyCustomFieldControl } from "../controls/Currency/CurrencyCustomFieldControl";
import { DurationCustomFieldControl } from "../controls/Duration/DurationCustomFieldControl";
import { EntityReferenceCustomFieldControl } from "../controls/EntityReference/EntityReferenceCustomFieldControl";
import { MediaReferenceCustomFieldControl } from "../controls/MediaReference/MediaReferenceCustomFieldControl";
import { RichTextCustomFieldControl } from "../controls/RichText/RichTextCustomFieldControl";
import {
  isEntityReferenceValue,
  isRichTextValue,
  type CustomFieldEntityReferenceValue,
  type CustomFieldRichTextValue,
} from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import { ColorPickerField } from "@core/ui/rich-text-editor/ColorPickerField";
import { RATING_MIN, RATING_MAX } from "../registries/valueTypeRegistry";

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
   * in customFieldValueValidation.ts, not per field). Read by the branches whose
   * controls accept it — reference, currency, duration and, since Wave 3.4, the
   * two media branches and rich text: i.e. exactly the six types GenericForm
   * draws through this dispatcher (`EXTENSION_DRAWN_FIELD_TYPES`). A branch that
   * cannot honour it silently ignoring it is better than a prop it pretends to
   * support.
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
          // validateSelectCustomFieldValue does in customFieldValueValidation.ts
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

  // Wave 3.4: File and Image -- both media reference types, ONE control, two
  // branches. The branches exist separately only to set `imagesOnly`, which is
  // the whole difference between the two value types at this tier and has
  // nowhere else to travel: both types pin the SAME target entity type
  // (`media.file`, from a code-owned one-key allowlist on each handler), so
  // unlike EntityReference/UserReference -- which share a dispatch key because
  // what differs between them arrives on `fc.referenceTargetEntityTypeKey` --
  // there is no property here that could carry the image-only rule. That is why
  // the catalog gives them two fieldConfigTypes; this is the code that consumes
  // the distinction.
  //
  // VALUE NARROWING, same posture as the reference branch below: `value` is
  // `unknown`, and anything that is not reference-shaped becomes null rather
  // than being handed through, because the control's contract is the envelope
  // and a base64 string or a browser `File` reaching it would be the exact
  // mis-wiring its own header comment is written against.
  //
  // TARGET KEY FROM THE PIN, THEN THE VALUE -- the identical two-source
  // ordering, and the same `.trim() || null` collapse, as the reference branch.
  // It is not copied for symmetry: the backend resolves the pin for these types
  // too (`ImplicitTargetEntityTypeKey` derives it from each handler's
  // `AllowedTargetKeys`, guarded on there being exactly one), so the pin is
  // delivered on the same property at the same resolution. Restating
  // `"media.file"` as a literal here would duplicate a backend allowlist this
  // layer cannot see, which is the standing argument the UserReference note
  // below makes for its own key.
  //
  // `disabled={isViewMode}`, matching the picker family (the control has a
  // button, not a text surface with anything to copy).
  if (fc.type === "media-file" || fc.type === "media-image") {
    const reference: CustomFieldEntityReferenceValue | null = isEntityReferenceValue(value)
      ? value
      : null;
    const pinnedTarget = fc.referenceTargetEntityTypeKey?.trim() || null;
    // No wrapping <Label>: the control renders its own label/region pair,
    // because its announced name comes from the group's `aria-label` rather
    // than a `<Label htmlFor>` a role="group" div cannot be named by.
    return (
      <MediaReferenceCustomFieldControl
        key={fc.name}
        id={fc.name}
        label={fc.label ?? fc.name}
        targetEntityTypeKey={pinnedTarget ?? reference?.entityTypeKey ?? null}
        imagesOnly={fc.type === "media-image"}
        value={reference}
        onChange={(next) => onChange(next)}
        required={fc.required}
        disabled={isViewMode}
        invalid={invalid}
        describedBy={describedBy}
      />
    );
  }

  // Wave 3.4: RichText. The one branch in this file whose job is a WIRE SHAPE
  // rather than a widget choice.
  //
  // `RichTextEditor` is `value: string` / `onChange(html: string)`; the wire is
  // the one-key object `{ html }`, and a bare string is REFUSED by
  // `RichTextValueTypeHandler.Parse` -- not as a matter of taste, but because
  // `InputSanitizationMiddleware`'s carve-out for this route is the PATH
  // `values.*.html`, so a bare string at `values.myField` arrives with every tag
  // already stripped and storing it would report success over destroyed markup.
  // The wrap/unwrap therefore lives in the control (see its header), and this
  // branch does the `unknown` -> envelope narrowing, exactly as the two
  // reference branches do theirs.
  //
  // `isRichTextValue(value) ? value : null` also quietly does the useful thing
  // for the one shape most likely to arrive by mistake: a BARE STRING narrows to
  // null, so a field holding out-of-band string data renders as empty rather
  // than as a string the control would then re-emit in a shape the server
  // refuses.
  //
  // NOT `"richtext"`, which already exists in FieldConfig["type"]: that member
  // is drawn by GenericForm's own switch and its arm reads and writes a bare
  // string. See the RichText entry in valueTypeRegistry.ts for the full trap.
  if (fc.type === "rich-text") {
    const rich: CustomFieldRichTextValue | null = isRichTextValue(value) ? value : null;
    return (
      <RichTextCustomFieldControl
        key={fc.name}
        id={fc.name}
        label={fc.label ?? fc.name}
        value={rich}
        onChange={(next) => onChange(next)}
        required={fc.required}
        disabled={isViewMode}
        placeholder={fc.placeholder}
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
