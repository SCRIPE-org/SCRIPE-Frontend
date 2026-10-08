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
 * `for`/`id` association is both correct and sufficient on its own.
 *
 * That native `for`/`id` name is also exactly why `<GenericForm>` must suppress
 * ITS own label for this type: the host's label targets the same `fc.name`, and
 * the accessible-name computation concatenates every matching `<label>`, so a
 * kept host label would have announced "Setup BufferSetup Buffer" as well as
 * showing the text twice. See `EXTENSION_DRAWN_FIELD_TYPES` in
 * `core/ui/forms/generic-form.tsx`, where each of the three extension-drawn
 * types' distinct labelling mechanism is recorded.
 *
 * **The unit annotation stays a VISIBLE sibling `<span>` (never
 * `aria-hidden`)**, in a `flex items-center gap-2` row -- which is not just this
 * control's own habit but the dominant unit-annotated-numeric pattern in the
 * repo (`TokenConfigSection.tsx`'s access-token-lifetime and refresh-token-
 * lifetime fields are the same `<Input className="w-24" /> + <span>{unit}</span>`
 * shape), and there is no prefix/suffix/addon slot on `@core/ui/input.tsx` to
 * use instead -- verified, not assumed: the only `suffix` prop in `@core/ui` is
 * `stat-card.tsx`'s, which is read-only display.
 *
 * **What DID change (Wave 4 follow-up, when this control was admitted to
 * `<GenericForm>`):** the span is now also the input's accessible DESCRIPTION,
 * via an id in `aria-describedby`. Being visible in DOM order was never the same
 * thing as being announced with the field: a screen-reader user landing on the
 * input heard "Setup Buffer, spin button" and had to keep browsing to discover
 * the unit -- for a control whose entire reason to exist is making that unit
 * explicit (ruling R4/PD-2). Wiring it as a description says it on arrival while
 * leaving the accessible NAME untouched, so the `getByRole("spinbutton", { name })`
 * gates in this file and in renderCustomFieldControl.test.tsx keep asserting the
 * same thing. Composed with any host-supplied `describedBy` rather than
 * overwriting it -- `aria-describedby` takes an id LIST, the same composition
 * `EntityReferenceCustomFieldControl` already does for its own note.
 *
 * **Rejected, deliberately, when this control was reviewed for generic-form
 * use:** an hours+minutes pair, a +/- stepper, and preset chips. No two-field or
 * stepper duration control exists anywhere in this repo to be consistent with.
 * Presets DO have a precedent (`core/ui/export-interval-select.tsx`'s chip row,
 * `useApiKeysViewModel`'s expiry select), but both pick from a FIXED domain
 * vocabulary; a tenant-defined Duration field has no such vocabulary -- the same
 * field type has to serve a session length, a warm-up, and a clip length, and
 * any preset set would be this control guessing at one of them. An "= 1 h 30 m"
 * read-out was rejected for a sharper reason: `formatCustomFieldValue.tsx`'s own
 * Duration case renders "90 minutes", so an hours read-out here would make one
 * stored value read differently in the table and in the form.
 */
import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { isFieldRequired, type FieldConfig } from "@core/ui/forms/generic-form";

/**
 * Documentation for module export
 */
export interface DurationCustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  /** Mirrors every other renderCustomFieldControl branch's isViewMode contract. */
  isViewMode?: boolean;
  /**
   * The HOST form's validation verdict for this field, when it has one. Supplied
   * by `GenericFormCustomFieldControl` (GenericForm holds an `errors` map and
   * renders its own error node); absent at the 8 hand-wired sites, which validate
   * at save time instead. See `CustomFieldControlProps` in
   * renderCustomFieldControl.tsx.
   */
  invalid?: boolean;
  /** Id of the host's hint/error node, composed into this input's own description. */
  describedBy?: string;
  /** Inline error message from host form */
  error?: string;
}

function toFieldInputValue(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

/**
 * Documentation for DurationCustomFieldControl
 */
export function DurationCustomFieldControl({
  fc,
  value,
  onChange,
  isViewMode,
  invalid,
  describedBy,
  error,
}: DurationCustomFieldControlProps): React.ReactElement {
  const isRequired = isFieldRequired(fc);
  const { t } = useI18n();
  const unitLabel = t("customField.duration.unitLabel");
  const unitId = `${fc.name}-unit`;

  return (
    <div className="space-y-2">
      <Label htmlFor={fc.name} className="text-sm font-medium">
        {fc.label ?? fc.name}
        {isRequired && (
          <span className="text-destructive ms-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={fc.name}
          type="number"
          min={0}
          // `step="any"` is load-bearing here, and measured rather than assumed.
          // An <input type="number"> with no step steps by 1, and the step BASE
          // is `min` if present -- which `min={0}` on the line above makes it. So
          // the accepted values were 0, 1, 2 ... and `1.5` was a stepMismatch,
          // which does not merely style the field: a form containing an invalid
          // control never fires `submit` at all. 1.5 is a documented, supported
          // Duration value (ruling R4: ValueNumber is decimal(18,6), "1.5 = 90
          // seconds") that formatCustomFieldValue.tsx deliberately round-trips as
          // "1.5 minutes" rather than rounding -- so a value the table displayed
          // could not be re-saved through the form.
          //
          // The gap only became reachable when this control was admitted to
          // <GenericForm>, whose <form> carries no noValidate: at the 8
          // hand-wired sites nothing submits natively, so the mismatch was inert.
          // (CurrencyCustomFieldControl's amount carries the same declaration for
          // a different reason -- it has no `min`, so its step base tracked its
          // own value and it was never actually broken. See that file.)
          //
          // `min={0}` stays -- it mirrors the handler's own MinDurationMinutes = 0
          // (zero accepted, negatives rejected), and `step="any"` relaxes the step
          // check only, never the floor.
          step="any"
          value={toFieldInputValue(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fc.placeholder}
          required={isRequired}
          disabled={isViewMode}
          aria-invalid={invalid || undefined}
          // The unit is part of what this field MEANS, so it rides in the
          // description rather than only sitting next to the box -- see this
          // file's header comment. Composed, never overwritten: a host's own
          // hint/error id keeps its place in the list.
          aria-describedby={[describedBy, unitId].filter(Boolean).join(" ")}
          className={cn("max-w-[10rem] text-sm", invalid && "border-destructive focus-visible:ring-destructive")}
        />
        {/* Visible, never aria-hidden. Storage is bare minutes (backend ruling
            R4); this is the one place that unit becomes explicit instead of
            implicit, so hiding it from either the sighted or the screen-reader
            path would defeat the control. It now carries an id purely so the
            input can point at it -- the rendered text is unchanged. */}
        <span id={unitId} className="shrink-0 text-sm text-nx-ink-3">
          {unitLabel}
        </span>
      </div>
      {invalid && error && (
        <p id={describedBy} className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

