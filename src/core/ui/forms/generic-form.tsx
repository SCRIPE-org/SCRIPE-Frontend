/**
 * Generic Form Component
 *
 * A highly flexible and customizable form builder that dynamically renders various input types
 * based on field configuration. Supports internationalization, dynamic styling, and conditional
 * field visibility.
 *
 * @example
 * ```tsx
 * const fields: FieldConfig[] = [
 *   {
 *     name: "username",
 *     label: "Username",
 *     type: "text",
 *     required: true,
 *     placeholder: "Enter your username"
 *   },
 *   {
 *     name: "email",
 *     label: "Email",
 *     type: "email",
 *     required: true,
 *     placeholder: "Enter your email"
 *   }
 * ];
 *
 * <GenericForm
 *   fields={fields}
 *   initialValues={{ username: "john", email: "john@example.com" }}
 *   onSubmit={async (data) => appLogger.ui(data)}
 *   onCancel={() => appLogger.ui("Cancelled")}
 * />
 * ```
 *
 * @author Seif
 * @version 2.0.0
 * @since 1.0.0
 */
"use client";

import React, { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { BilingualOptionsEditor } from "@core/ui/forms/bilingual-options-editor";
import GenericSelect from "@core/crud/components/generic-select";
import { Switch } from "@core/ui/switch";
import { Separator } from "@core/ui/separator";
import { ErrorMessage } from "@core/ui/error-message";
import { Slider } from "@core/ui/slider";
import { Checkbox } from "@core/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn, toDateInputValue, fromDateInputValue } from "@core/common/utils";
import { DatePicker } from "@core/ui/date-picker";
import { RichTextEditor } from "@core/ui/rich-text-editor";
import { ImageUploader } from "@core/ui/image-uploader";
import { PasswordInput } from "@core/ui/password-input";
import { usePermissions } from "@core/providers/permission-provider";
import type { PermissionCode } from "@core/common/types/permissions";
// Type-only for the props contract, plus the registry READ. Not a cycle: this
// module is `core`, and customFieldsExtension.tsx's own import of `FieldConfig`
// from this file is `import type`, erased at build — its only runtime imports
// are react and the i18n provider.
import {
  getCustomFieldsExtension,
  type CustomFieldFormControlProps,
} from "@core/crud/customFieldsExtension";

/**
 * Field option for select, radio, and other choice-based inputs
 */
export interface FieldOption {
  /** The value of the option (submitted to backend) */
  value: string;
  /** The display label for the option */
  label: string;
  /** Nested options for hierarchical structures (e.g., tree selects) */
  children?: FieldOption[];
  /** Unique key for deduplication when value may change between API calls */
  uniqueKey?: string;
}

/**
 * Configuration object for form fields
 *
 * Defines the structure and behavior of individual form fields,
 * including validation, styling, and conditional logic.
 */
export interface FieldConfig {
  name: string;
  label?: string; // Optional for hidden fields
  type:
    | "text"
    | "password"
    | "email"
    | "number"
    // Wave 3.3 Batch C (CustomFields' Currency/Duration value types).
    // "currency" backs a real, dedicated CurrencyCustomFieldControl (a
    // paired amount + ISO 4217 code control -- see that file's own header
    // comment for why Currency could not simply reuse "number" the way
    // Percent does: two independently required pieces need two inputs, not
    // one). "duration" backs DurationCustomFieldControl (a number input with
    // an explicit, localized "minutes" unit annotation -- reusing bare
    // "number" here would make Duration indistinguishable from
    // Number/Percent inside that shared dispatcher, and re-introduce PD-2's
    // "a bare number whose unit is implicit" ambiguity at the UI layer).
    //
    // THIS COMPONENT DOES DRAW BOTH, through the same extension registry
    // "entity-reference" below goes through -- see
    // `EXTENSION_DRAWN_FIELD_TYPES`. The claim that used to stand here ("not
    // consumed by this component's own render switch ... none of them mounts
    // a <GenericForm> over these fields") was true of the 8 hand-wired
    // CustomFields sites and false of everything else: generic-crud-view.tsx
    // concatenates the extension's own fieldConfigs into the `fields` it
    // hands <GenericForm>, so on the ~30 CrudConfig sites that declare an
    // `entityTypeKey` both types genuinely reached the switch, missed it, and
    // fell through to `<Input type={field.type} value={formData[name] ?? ""}>`
    // -- a text box that painted a Currency object as `[object Object]` and
    // replaced it with a string on the first keystroke, exactly the defect
    // "entity-reference" was fixed for.
    //
    // Only "currency" is object-valued, so only it needs a required-emptiness
    // rule of its own (`OBJECT_VALUED_EMPTINESS_CHECKS`). "duration" is a
    // plain minutes number, and the pre-existing scalar arm already treats a
    // stored `0` as filled -- which is the answer the backend wants, since
    // DurationValueTypeHandler accepts zero and only rejects negatives.
    | "currency"
    | "duration"
    // Wave 4 (CustomFields' EntityReference/UserReference value types). Both
    // map here: they differ only in which target entity type their picker is
    // fed, which is data, not a control kind.
    //
    // THIS COMPONENT DOES DRAW IT, but never by importing the control. Earlier
    // waves left this type with no render arm on purpose -- the control needs
    // the CustomFields module (the entity-lookup search/resolve hooks, which
    // reach that module's DI container), `core` must not import from
    // `src/modules/*` (docs/architecture/01-modularity.md's Dependency Rule),
    // and a direct import would additionally close a runtime cycle
    // (generic-form -> control -> module DI -> valueTypeRegistry ->
    // generic-form) and pull the whole CustomFields data layer into every form
    // in the product. That comment named the honest route itself, and this is
    // it: `CustomFieldsExtensionApi.FieldControl`, reached through the same
    // registry every other module capability arrives by. See
    // `EXTENSION_DRAWN_FIELD_TYPES` and `CustomFieldExtensionControl` below.
    //
    // Leaving the arm out was not a neutral "later": custom-field FieldConfigs
    // genuinely reach this component (generic-crud-view.tsx concatenates
    // useCustomFieldsFormFields's fieldConfigs into the `fields` it hands
    // <GenericForm>, and `visibleFields` filters only on isVisible/permissions),
    // so an unhandled type fell through to the plain `<Input type={field.type}>`
    // default -- a text box showing `[object Object]` that replaced the stored
    // object with a string the moment anyone typed in it.
    //
    // It is also in the required-validation `customTypes` set below: a required
    // reference submitted blank has to be caught in this path too, and a
    // reference value is an object, which the old emptiness check waved through
    // -- see `isRequiredFieldEmpty` below.
    | "entity-reference"
    // Wave 3.4 (CustomFields' File/Image/RichText value types). All three are
    // EXTENSION-DRAWN, like "entity-reference" above and for the same
    // Dependency-Rule reason: their controls live in the CustomFields module and
    // `core` must not import from `src/modules/*`.
    //
    // WHY THREE NEW MEMBERS RATHER THAN REUSING "file", "image" AND "richtext",
    // which already exist a few lines below and already render. Because all
    // three of those render arms produce a DIFFERENT VALUE SHAPE than these
    // types accept, and this component's own history is the argument: the
    // `[object Object]` defect "entity-reference" was added to fix was exactly a
    // custom-field type routed to an arm whose value shape did not match.
    //   - "file" renders `<Input type="file">`, whose value is a browser `File`.
    //   - "image" renders `<ImageUploader>`, whose value is a base64 string.
    //   - "richtext" renders `<RichTextEditor value={formData[name] ?? ""}
    //     onChange={(value) => handleChange(name, value)}>`, i.e. a bare string.
    // A File/Image value is `{ entityTypeKey, entityId }` -- a reference to a
    // media row -- and a RichText value is `{ html }`. The server refuses each of
    // the three wrong shapes outright (RichText's refusal is deliberate: the
    // input-sanitization middleware's carve-out for the values route is the PATH
    // `values.*.html`, so a bare string arrives with every tag already stripped
    // and storing it would silently destroy the operator's markup). So pointing
    // at the existing member would not be a shortcut, it would ship a field that
    // 422s on every save on the ~30 CrudConfig screens where this component
    // draws custom fields itself.
    //
    // Adding the new types TO the existing members' render arms was the other
    // option and is worse: it would make those three arms permanently dead and
    // permanently seize the three most generically-named members of this union
    // for "a reference to a media row" and "prose in an object envelope", so a
    // real upload field could never use them again.
    //
    // "media-file" and "media-image" are TWO members, not one shared media key,
    // because both value types pin the same target entity type and nothing else
    // carries the image-only restriction -- see the catalog entries in the
    // CustomFields module for the full reasoning. Both are object-valued, so
    // both need an `OBJECT_VALUED_EMPTINESS_CHECKS` rule; "rich-text" is object-
    // valued too and needs its own, since a blank `{ html: "" }` envelope is an
    // unfilled field.
    | "media-file"
    | "media-image"
    | "rich-text"
    | "tel"
    | "url"
    | "textarea"
    | "bilingual-options"
    | "richtext"
    | "select"
    | "searchable-select"
    | "server-select"
    | "multi-select"
    | "tree"
    | "switch"
    | "checkbox"
    | "radio"
    | "slider"
    | "range"
    | "hidden"
    | "date"
    | "datetime"
    | "datetime-local"
    | "time"
    | "month"
    | "week"
    | "color"
    | "file"
    | "image";
  placeholder?: string;
  searchPlaceholder?: string; // For searchable selects
  required?: boolean;
  options?: FieldOption[];
  treeData?: FieldOption[]; // For tree select type
  defaultValue?: any;
  // Input specific options
  min?: number | string; // For number, date, range inputs
  max?: number | string; // For number, date, range inputs
  step?: number | string; // For number, range inputs
  /**
   * For "bilingual-options": the form key holding the SECOND (Arabic) newline-separated list. The
   * control edits both halves together and writes both keys, because the two are positionally
   * aligned and editing one without the other would misalign every option after the edit.
   */
  pairedName?: string;
  rows?: number; // For textarea
  cols?: number; // For textarea
  /** For "bilingual-options": the "add another option" button's label. */
  addLabel?: string;
  /** For "bilingual-options": the per-row remove button's accessible label. */
  removeLabel?: string;
  /** For "bilingual-options": the hint shown when no options exist yet. */
  emptyHint?: string;
  /**
   * For "entity-reference": the entity type the field's DEFINITION is pinned to, i.e. what the
   * picker should offer. Absent/null means the definition does not say, which is a real state (an
   * unpinned EntityReference accepts any registered entity type, so there is no single answer) and
   * not merely an unwired one.
   *
   * A CARRIER ONLY — this component never reads it, and still does not: the whole `field` is handed
   * to `CustomFieldsExtensionApi.FieldControl` (or to renderCustomFieldControl.tsx at the 8
   * hand-wired sites), and the pin is read there, because the control needs the CustomFields module
   * and `core` must not import from `src/modules/*` — see the `"entity-reference"` member's own
   * comment above. Passing `field` whole rather than unpacked scalars is exactly what keeps this
   * carrier working without a new prop on the extension contract.
   * The field travels here rather than in a module-side side-channel because `FieldConfig[]` IS the
   * boundary type the extension hands across that line; a parallel map keyed by field name would
   * have to be threaded through every one of the nine consumer sites separately.
   *
   * NOT consulted by `isRequiredFieldEmpty`, on purpose: whether a reference is filled is a question
   * about the VALUE's two pieces, and a pin says nothing about whether the user picked anything.
   */
  referenceTargetEntityTypeKey?: string | null;
  accept?: string; // For file inputs and image uploader
  multiple?: boolean; // For file inputs and multi-select
  // Image uploader specific options
  maxSize?: number; // Max file size in bytes (default: 5MB)
  showPreview?: boolean; // Whether to show image preview (default: true)
  aspectRatio?: string; // e.g., "16/9", "1/1"
  // Searchable select specific options
  searchType?: "client" | "server";
  onServerSearch?: (query: string) => Promise<FieldOption[]>;
  searchEndpoint?: string;
  debounceMs?: number;
  allowClear?: boolean;
  noResultsText?: string;
  searchingText?: string;
  // Dynamic field behavior
  dependsOn?: string; // Field name this field depends on
  isVisible?: (formData: Record<string, any>) => boolean; // Function to determine visibility
  onChange?: (value: any, formData: Record<string, any>) => void | Record<string, any>; // Callback when field value changes, can return object to update multiple fields
  loading?: boolean; // Show loading state
  disabled?: boolean; // Disable field
  // Validation
  pattern?: string; // For text inputs
  minLength?: number; // For text inputs
  maxLength?: number; // For text inputs
  // Permissions
  requiredPermission?: PermissionCode;
  requiredPermissions?: PermissionCode[];
  // Helper/description text (shown below the field)
  description?: string;
  // Browser autocomplete & password manager control
  autoComplete?: string;
  // Section layout (absent on every field = current flat single-column behaviour)
  section?: string; // Title of the hairline-ruled group; consecutive fields with the same section are grouped
  colSpan?: 1 | 2; // Width in the two-column section grid; any colSpan in a group switches it to sm:grid-cols-2
}

/**
 * Wave K collapse: formStyle used to re-skin the FIELDS — cyan-on-black
 * "neon", slate "elegant", green "organic", orange "retro", a glass wash and a
 * gradient card, all in raw colour literals with dark: forks. Field skin has
 * exactly one owner now (Settings inputStyle, applied inside Input / Textarea
 * / Select), so formStyle keeps only what it can honestly control: the
 * CONTAINER and the DENSITY. Retired decorative values resolve onto the
 * nearest survivor; the stored-value migration itself is Wave C's job.
 */
const FORM_CONTAINER: Record<string, "flat" | "card" | "minimal"> = {
  card: "card",
  modern: "card",
  glass: "card",
  minimal: "minimal",
};

/**
 * Props for the GenericForm component
 */
interface GenericFormProps {
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  readOnly?: boolean; // New prop for read-only mode
}

/**
 * Generic Form Component
 *
 * Renders a dynamic form based on field configuration with support for:
 * - Multiple input types (text, select, date, file, etc.)
 * - Conditional field visibility
 * - Internationalization
 * - Dynamic styling based on settings
 * - Form validation
 * - Read-only mode
 *
 * @param props - The component props
 * @param props.fields - Array of field configurations
 * @param props.initialValues - Initial form values
 * @param props.onSubmit - Callback when form is submitted
 * @param props.onCancel - Callback when form is cancelled
 * @param props.readOnly - Whether the form is in read-only mode
 * @returns JSX element representing the form
 */
/**
 * Stable identity for the omitted-prop case. An inline `initialValues = {}`
 * default is re-created on EVERY render of this component, so the re-init
 * effect below saw changed deps forever and re-entered itself.
 */
const NO_INITIAL_VALUES: Record<string, any> = {};

/**
 * Field types whose form value is a multi-piece OBJECT envelope rather than a
 * scalar or an array, each paired with the rule that decides whether ITS
 * envelope counts as unfilled — because "is this required field empty" cannot
 * be answered from the envelope alone, and the answer is not the same question
 * for two different envelopes.
 *
 * A MAP, not a set with a switch beside it. The predecessor here was a
 * `Set<FieldConfig["type"]>` whose single member's shape was then hardcoded
 * inline in `isRequiredFieldEmpty` as `{ entityTypeKey, entityId }` — fine for
 * one member, and a drift trap the moment a second type with a DIFFERENT shape
 * joined it, because membership and shape lived in two places. Currency is that
 * second type (`{ amount, currencyCode }` — nothing to do with a reference's two
 * fields), so the type and its own rule are bound together here and cannot
 * disagree.
 *
 * Each predicate is only ever called with a non-null `object` (the scalar and
 * array arms run first, and a non-object on an object-valued field fails closed
 * before dispatch), so no predicate re-checks that.
 *
 * `"datetime"` is deliberately absent, and that is a finding rather than an
 * omission: its value IS a two-piece `{ value, timeZoneId }` object on the wire,
 * but this component converts every date-family value through
 * `toDateInputValue`/`fromDateInputValue`, so what reaches the check is always a
 * STRING. Admitting it would change a shipped type's behaviour on a guess about
 * a shape that never arrives here. Pinned by a test in
 * generic-form.requiredObjectValue.test.tsx.
 *
 * `"duration"` is absent because it is not object-valued at all — see its own
 * `FieldConfig["type"]` member comment above.
 */
const OBJECT_VALUED_EMPTINESS_CHECKS: Partial<
  Record<FieldConfig["type"], (value: object) => boolean>
> = {
  /**
   * Mirrors the backend's own write gate rather than inventing a rule:
   * `EntityReferenceValueTypeHandler.Validate` refuses a reference unless BOTH
   * the target type key and the encrypted id are present and non-blank, so a
   * half-blank reference is not a storable value and "required" must not accept
   * one.
   *
   * PRESENCE, not shape: this does not try to judge whether `entityId` is a
   * well-formed encrypted id. A malformed-but-present value is a FORMAT problem
   * with its own message, not a missing one.
   *
   * The body moved into `referenceEnvelopeIsEmpty` below when Wave 3.4's two
   * media types joined it: they hold the same envelope, and three inline copies
   * of one rule is how one of them ends up corrected and the other two do not.
   */
  "entity-reference": referenceEnvelopeIsEmpty,
  /**
   * Currency's rule is read off `CurrencyValueTypeHandler` (backend
   * CustomFields.Application/ValueTypes), whose two methods answer two
   * different questions and have to be composed rather than picked between:
   *
   *   - `IsEmpty` returns true only when the amount AND the code are both
   *     missing. That is "nothing to save", and it is already caught before this
   *     predicate runs: the control emits `null` when the user blanks the last
   *     populated piece, and the scalar arm rejects `null`.
   *   - `Validate` (which runs for everything `IsEmpty` let through) requires
   *     BOTH pieces. So a half-blank Currency is not "empty" server-side — it is
   *     a 422. The handler's own comment is explicit that this is deliberate:
   *     treating a half-blank as empty "would silently skip Validate and let a
   *     genuinely-entered (but incomplete ...) amount or code through with no
   *     error".
   *
   * A required field is satisfied only by a value the server will actually
   * store, so this refuses a half-blank — the same composition, and the same
   * presence-not-shape scope, as the reference rule above. The code's alpha-3
   * GRAMMAR is not checked here; that is `pattern` on the control's own input
   * (mirroring `IsValidCurrencyCode`) and the server's `currencyCodeInvalid`,
   * not a missing-value verdict.
   *
   * `amount` is checked for MISSING-ness, never truthiness: `0` is a legitimate
   * amount and `-1` is too (the handler enforces no minimum — a credit or a
   * refund is a real currency value), so the blank test mirrors the handler's own
   * `Amount is null || (Amount is string s && IsNullOrWhiteSpace(s))` exactly.
   */
  currency: (value) => {
    const money = value as { amount?: unknown; currencyCode?: unknown };
    const amountMissing =
      money.amount === undefined ||
      money.amount === null ||
      (typeof money.amount === "string" && money.amount.trim() === "");
    const codeMissing =
      typeof money.currencyCode !== "string" || money.currencyCode.trim() === "";
    return amountMissing || codeMissing;
  },
  /**
   * Wave 3.4. File and Image (CustomFields' two media reference types) hold the
   * SAME `{ entityTypeKey, entityId }` envelope a general reference does -- on
   * the backend `FileValueTypeHandler` literally extends
   * `EntityReferenceValueTypeHandler` -- so the rule is `"entity-reference"`'s,
   * reused by reference to it rather than re-derived, which is what keeps a
   * later correction to one from silently leaving the other two behind.
   *
   * SHARED BUT STILL THREE ENTRIES, not one entry under a shared key: the two
   * media types deliberately carry two different `FieldConfig["type"]` members
   * (only two keys can express "this one is images-only"), and this map is keyed
   * by that member, so each needs its own line. Predicate identity is the
   * mechanism that keeps them honest about being the same rule.
   *
   * The presence-not-shape scope carries over too. Whether the referenced media
   * row is actually OWNED by the record being edited -- the backend's owner-pair
   * fence, and the whole reason `media.file` is a legal reference target at all
   * -- is not a question this layer can answer at all: it needs the media row.
   * A required field being "filled" therefore means "the operator picked
   * something", never "the server will accept it".
   */
  "media-file": referenceEnvelopeIsEmpty,
  "media-image": referenceEnvelopeIsEmpty,
  /**
   * Wave 3.4. RichText's envelope is `{ html }` and blank markup is an unfilled
   * field, so a required rich-text field is not satisfied by an empty editor.
   *
   * WHITESPACE COUNTS AS BLANK, matching `RichTextValueTypeHandler.IsEmpty`
   * exactly (`string.IsNullOrWhiteSpace(input.Html)`) -- a field the operator
   * cleared should read as cleared, and an editor that leaves a stray newline
   * behind has not stored a value.
   *
   * MARKUP THAT RENDERS TO NOTHING (`<p></p>`) IS NOT BLANK HERE, and that is
   * the backend's decision reproduced rather than a gap: deciding whether markup
   * renders to nothing means parsing it, which that handler's own comment
   * declines to do on every field of every save. The control avoids producing
   * this state (it emits `null` when the editor is empty) so it is reachable
   * only from stored or out-of-band data, and it is refused server-side by
   * nothing -- an empty paragraph is a value the server stores. Treating it as
   * filled is therefore the answer that agrees with the server, which is the
   * whole contract of this map.
   */
  "rich-text": (value) => {
    const rich = value as { html?: unknown };
    return typeof rich.html !== "string" || rich.html.trim() === "";
  },
};

/**
 * The reference-envelope rule, extracted so the three field types that share it
 * (`"entity-reference"` and Wave 3.4's two media types) share the FUNCTION and
 * not merely a copy of its body. Mirrors the backend's own write gate:
 * `EntityReferenceValueTypeHandler.Validate` refuses a reference unless BOTH the
 * target type key and the encrypted id are present and non-blank, so a
 * half-blank reference is not a storable value and "required" must not accept
 * one.
 *
 * PRESENCE, not shape: this does not try to judge whether `entityId` is a
 * well-formed encrypted id. A malformed-but-present value is a FORMAT problem
 * with its own message, not a missing one.
 *
 * @param value The field's current value, already known to be a non-null object.
 * @returns True when the envelope is missing either piece, i.e. counts as unfilled.
 */
function referenceEnvelopeIsEmpty(value: object): boolean {
  const ref = value as { entityTypeKey?: unknown; entityId?: unknown };
  return (
    typeof ref.entityTypeKey !== "string" ||
    ref.entityTypeKey.trim() === "" ||
    typeof ref.entityId !== "string" ||
    ref.entityId.trim() === ""
  );
}

/**
 * Field types this component declares for `FieldConfig["type"]`'s typing but
 * cannot draw itself, and therefore routes to
 * `CustomFieldsExtensionApi.FieldControl`.
 *
 * A set rather than a `field.type === "entity-reference"` literal in the three
 * places that need it (the label suppression, the render arm, and the
 * required-validation set in `handleSubmit`) so admitting the next such type is
 * one line here, not three scattered comparisons that can drift apart. Kept
 * deliberately SEPARATE from `OBJECT_VALUED_EMPTINESS_CHECKS` above: "core
 * cannot draw this" and "this value is a multi-piece object" are different
 * questions with different answers, and `"duration"` is the proof — extension-
 * drawn and a plain scalar.
 *
 * `"currency"` and `"duration"` joined `"entity-reference"` once the
 * verification the previous author deferred was actually done. That note asked
 * for one thing — check each control's labelling against this component's field
 * anatomy rather than assuming it — and the answer differs per control, which is
 * why it could not be assumed:
 *
 *   - `DurationCustomFieldControl` renders `<Label htmlFor={fc.name}>` over a
 *     real `<input type="number" id={fc.name}>` and NO `aria-label`, so its
 *     accessible name comes from that native `for`/`id` pair. Keeping this
 *     component's own label would emit a SECOND `<label for>` pointing at the
 *     same input — and per the accname spec every matching `<label>` is
 *     concatenated, so the field would have announced its own name twice
 *     ("Setup BufferSetup Buffer") on top of showing two identical visible
 *     labels. Suppression required.
 *   - `CurrencyCustomFieldControl` renders its own `<Label htmlFor={fc.name}>`
 *     too, but its amount input ALSO carries an `aria-label`
 *     (`customField.currency.amountLabel`), which wins over any `<label>` in the
 *     accname cascade — so there the duplicate would have been purely visual
 *     rather than announced. Suppression required for a different reason, and
 *     the two really are not the same case.
 *   - `EntityReferenceCustomFieldControl` is the third distinct case, the one
 *     already documented below: its trigger is a `role="combobox"` div that no
 *     `<label for>` can name at all.
 *
 * Three controls, three mechanisms, one conclusion. What the check ALSO turned
 * up is why it mattered beyond labels. This component's `<form>` carries no
 * `noValidate`, so a control that fails native constraint validation does not
 * merely get styled — the form never fires `submit` at all. Both controls'
 * number inputs shipped with no `step`, which defaults to 1, and
 * `DurationCustomFieldControl`'s `min={0}` pins its step base at 0: a stored
 * `1.5` minutes (a documented, supported value) was therefore unsubmittable the
 * moment Duration was drawn here. Fixed at that control (`step="any"`), not here.
 * Currency's amount turned out NOT to have the same live defect — no `min`, so
 * its step base tracks its own value — which is exactly the kind of thing
 * "verify, don't assume" was asking for; it carries the same declaration as a
 * guard, with its own reasoning recorded in that file.
 */
/*
 * Wave 3.4 admits `"media-file"`, `"media-image"` and `"rich-text"`, and the
 * per-control labelling check this set's comment demands was done for each
 * rather than inherited from the three above:
 *
 *   - `MediaReferenceCustomFieldControl` renders its own `<Label htmlFor={id}>`
 *     over a `role="group"` region, and the group carries an `aria-label`.
 *     Keeping this component's label would show two identical visible labels;
 *     the announced name comes from the group's own `aria-label`, so the
 *     duplicate would be visual only -- Currency's case exactly.
 *   - `RichTextCustomFieldControl` renders its own `<Label htmlFor={id}>` and
 *     binds it to the editor's contenteditable region by `aria-labelledby`,
 *     because `<Label htmlFor>` alone names nothing on a `role="textbox"` div.
 *     A second `<label for>` from here would be concatenated into the announced
 *     name per the accname spec -- Duration's case, arrived at by a different
 *     mechanism. Suppression required for all three.
 *
 * Membership here also carries two consequences these types genuinely need, and
 * that is why it is the right set rather than a fourth ad-hoc condition: the
 * spread into `handleSubmit`'s `customTypes` (none of the three has a native
 * `required` attribute the browser could enforce -- the media control has no
 * form element in it at all) and the label suppression above.
 */
const EXTENSION_DRAWN_FIELD_TYPES = new Set<FieldConfig["type"]>([
  "entity-reference",
  "currency",
  "duration",
  "media-file",
  "media-image",
  "rich-text",
]);

/**
 * One field of a type only the CustomFields module can draw — plus the explicit
 * state for when that module is not present.
 *
 * THE FALLBACK IS THE POINT. `core` is usable with no CustomFields module
 * registered (every hand-built `CustomFieldsExtensionApi` test double in this
 * codebase omits `FieldControl`, and `FieldControl` is optional for exactly that
 * reason), and the one thing that path must never do is what the bug did: fall
 * through to `<Input type="entity-reference" value={formData[name] ?? ""}>`,
 * which renders a stored reference object as `[object Object]` in an editable
 * text box and replaces it with a string on the first keystroke. So this renders
 * an inert, explanatory field instead.
 *
 * WHAT IT DOES NOT SHOW is deliberate: not the held value, for any of the three
 * types it now covers. The sharpest case is a reference, whose `entityId` is an
 * ENCRYPTED foreign primary key that only the resolve hook inside the very
 * module that is missing can turn into a human name — printing it would leak an
 * opaque id into the page and read as data corruption. Currency and Duration
 * hold nothing secret, but printing a value with no way to edit it invites the
 * operator to believe the field is merely read-only rather than broken, and the
 * uniform inert statement says the true thing for all three. The value itself is
 * untouched in every case — there is no `onChange` path here, so whatever was
 * loaded is still in `formData` and is resubmitted verbatim.
 *
 * THE COPY REUSES `errors.module.*`, a CORE locale key pair, which matters more
 * than it looks: a module locale key (`customField.*`) is registered by the very
 * module whose absence produced this state, so on the path that actually renders
 * it `t()` would return the bare key. `module-error-boundary.tsx` already
 * composes these same two keys the same way, for the same fact.
 *
 * A11Y: the label/`aria-invalid`/`aria-describedby` contract this component's
 * other branches provide is kept. The label is rendered here rather than by the
 * shared header above (see `EXTENSION_DRAWN_FIELD_TYPES` in that condition),
 * because each registered control renders its own label — the alternative was
 * two visible labels on the same field. `role="group"` is what makes `aria-label`
 * and `aria-describedby` actually exposed on a `<div>`; `aria-disabled` rather
 * than `disabled` because there is no widget here to disable, only a statement.
 */
function CustomFieldExtensionControl({
  field,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: CustomFieldFormControlProps) {
  const { t } = useI18n();
  // Read at render, not through a hook: this is a plain module-level variable
  // lookup (the same way buildCustomFieldColumn reads it), and registration
  // happens once from the app's composition root before any screen mounts.
  const FieldControl = getCustomFieldsExtension()?.FieldControl;

  if (FieldControl) {
    return (
      <FieldControl
        field={field}
        value={value}
        onChange={onChange}
        disabled={disabled}
        invalid={invalid}
        describedBy={describedBy}
      />
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-start">
        {field.label}
      </Label>
      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props --
          `aria-invalid` is a GLOBAL ARIA state (WAI-ARIA 1.1 promoted it to
          §6.5 Global States and Properties, and 1.2 keeps it there), so it is
          valid on any role including `group`. The rule's role table is
          aria-query's older per-role list, which predates that promotion — the
          warning is the plugin being out of date, not this markup being wrong.
          It is kept rather than dropped because this component's every other
          branch sets it, and the required-field pass genuinely does reject this
          field; `aria-describedby` alone would leave the rejection unannounced
          as a state. */}
      <div
        id={field.name}
        role="group"
        aria-label={field.label ?? field.name}
        aria-disabled="true"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        // Matches Input's own disabled skin (input.tsx: border-nx-line,
        // bg-nx-raised, text-nx-ink-3, no shadow) so it reads as a field that
        // is present but inoperable, not as a paragraph that lost its box.
        className="flex min-h-10 w-full cursor-not-allowed items-center rounded-nx-control border border-nx-line bg-nx-raised px-3 py-2 text-sm text-nx-ink-3"
      >
        {t("errors.module.description", { module: t("errors.module.unnamed") })}
      </div>
    </div>
  );
}

/**
 * Whether a required field counts as unfilled at submit time.
 *
 * THE BUG THIS EXISTS FOR: the check used to be, inline and in one expression,
 * `val === undefined || val === null || val === "" || (Array.isArray(val) &&
 * val.length === 0)`. Every arm of that tests a scalar or an array, so ANY
 * object passed — `{}` included, and `{ entityTypeKey: "hrms.staff-member",
 * entityId: "" }` in particular. A required entity-reference field with nothing
 * actually picked therefore validated as filled, submitted, and came back a 422
 * from the server (or, worse, wrote a half-blank the server then had to refuse)
 * instead of showing the user "this field is required" next to the field.
 *
 * The scalar and array arms are reproduced here byte-for-byte and are reached
 * first, so behaviour for every field type that existed before is unchanged: a
 * type with no entry in `OBJECT_VALUED_EMPTINESS_CHECKS` still falls through to
 * `false` for a non-empty scalar and for any object, exactly as before. Only a
 * field whose type declares an object rule gets one.
 *
 * That scalar arm is also, on inspection, already the RIGHT rule for
 * `"duration"` — the other type admitted to the extension-drawn set alongside
 * Currency — rather than merely a harmless one. Duration's stored value is bare
 * minutes, and `DurationValueTypeHandler.IsEmpty` is `null || whitespace-only
 * string`, with `Validate` accepting zero outright ("a zero-minute
 * buffer/duration is a legitimate value") and rejecting only negatives. Blank,
 * absent and zero are therefore three distinguishable states server-side, and
 * the arm above already distinguishes them the same way: `undefined`/`null`/`""`
 * are refused, while `0` and `"0"` fall through as filled. No new arm, and
 * specifically no `String(val).trim()` generalisation — that would silently
 * start rejecting whitespace on every scalar type in the product, and a
 * `<input type="number">` cannot produce a whitespace value anyway (the value
 * sanitisation algorithm yields `""` for anything it cannot parse).
 *
 * A non-object value on an object-valued field fails closed: no scalar can ever
 * be a reference, and none can be a `{ amount, currencyCode }` pair either.
 *
 * Both object shapes are restated in `OBJECT_VALUED_EMPTINESS_CHECKS` rather
 * than imported from the CustomFields module's own model, and that is required
 * rather than sloppy: `core` cannot import from `src/modules/*`
 * (docs/architecture/01-modularity.md's Dependency Rule — the same constraint
 * that makes core/crud/customFieldsExtension.tsx a registry instead of an
 * import, and that makes this file's `FieldConfig[]` the boundary type in the
 * first place). If a wire shape ever changes, both have to change.
 *
 * @param field The field being validated; its `type` selects the strategy.
 * @param val The current form value for that field.
 * @returns True when the value should be reported as a missing required field.
 */
function isRequiredFieldEmpty(field: FieldConfig, val: unknown): boolean {
  if (val === undefined || val === null || val === "") return true;
  if (Array.isArray(val)) return val.length === 0;

  const isEnvelopeEmpty = OBJECT_VALUED_EMPTINESS_CHECKS[field.type];
  if (isEnvelopeEmpty) {
    if (typeof val !== "object") return true;
    return isEnvelopeEmpty(val);
  }

  return false;
}

export function GenericForm({
  fields,
  initialValues = NO_INITIAL_VALUES,
  onSubmit,
  onCancel,
  readOnly = false,
}: GenericFormProps) {
  const settings = useSettings();
  const { t, direction } = useI18n();
  const { hasPermission, hasAnyPermission } = usePermissions();

  // Helper function to initialize form data with default values
  const initializeFormData = React.useCallback(
    (currentFields: FieldConfig[], currentInitialValues: Record<string, any>) => {
      const data = { ...currentInitialValues };
      // Set default values for fields that have them and convert dates for HTML inputs
      currentFields.forEach((field) => {
        if (field.defaultValue !== undefined && data[field.name] === undefined) {
          data[field.name] = field.defaultValue;
        }
        // Convert date fields from API format to HTML input format
        if (
          (field.type === "date" ||
            field.type === "datetime" ||
            field.type === "datetime-local" ||
            field.type === "time" ||
            field.type === "month" ||
            field.type === "week") &&
          data[field.name]
        ) {
          data[field.name] = toDateInputValue(data[field.name]);
        }
      });
      return data;
    },
    []
  );

  const [formData, setFormData] = useState<Record<string, any>>(() =>
    initializeFormData(fields, initialValues)
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  /** Rejection from onSubmit. The form used to swallow these entirely. */
  const [serverError, setServerError] = useState<string | null>(null);

  // Re-initialize form data when fields change (for dynamic forms)
  // IMPORTANT: Only populate values for NEW fields that don't exist in the current
  // form data. Never overwrite existing user-typed values with initialValues.
  // The updater MUST return the previous object unchanged when it adds nothing.
  // It used to spread unconditionally, so every run produced a new state
  // reference, React re-rendered, the effect re-ran on its unstable deps, and
  // the form span out on "Maximum update depth exceeded" (React error #185).
  // Bailing out on the no-op keeps that loop closed even if a caller rebuilds
  // `fields` or `initialValues` on every render.
  React.useEffect(() => {
    setFormData((prevData) => {
      let added = false;
      const preservedData = { ...prevData };
      fields.forEach((field) => {
        // Only set default/initial value if this field has NO value yet
        if (preservedData[field.name] === undefined) {
          if (field.defaultValue !== undefined) {
            preservedData[field.name] = field.defaultValue;
            added = true;
          } else if (initialValues[field.name] !== undefined) {
            preservedData[field.name] = initialValues[field.name];
            added = true;
          }
        }
      });
      return added ? preservedData : prevData;
    });
  }, [fields, initialValues]);

  const handleChange = (name: string, value: any, extraKeys?: Record<string, any>) => {
    // Clear error when user changes the field
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    setFormData((prev) => {
      // `extraKeys` lets ONE control own more than one form key -- used by the bilingual options
      // editor, whose two newline lists are positionally aligned and must be written together or
      // every option after an edit shifts onto the wrong translation. Merged before the field's own
      // onChange runs, so a caller can still override.
      const newData = { ...prev, [name]: value, ...(extraKeys ?? {}) };

      // Find the field that changed and call its onChange callback if it exists
      const field = fields.find((f) => f.name === name);
      if (field?.onChange) {
        const result = field.onChange(value, newData);
        // If onChange returns an object, merge it into newData to update multiple fields
        if (result && typeof result === "object" && !Array.isArray(result)) {
          return { ...newData, ...result };
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Re-entrancy guard: the fields stay editable while a submit is in flight,
    // and Enter in any of them re-fires this handler.
    if (loading) return;
    setServerError(null);

    // Validate required fields for custom components (select, searchable-select, etc.)
    // Native HTML inputs handle required validation via browser, but custom components need manual checks
    const customTypes = new Set([
      "select",
      "searchable-select",
      "server-select",
      "multi-select",
      "tree",
      "switch",
      "checkbox",
      "radio",
      "slider",
      "range",
      "date",
      "datetime",
      "datetime-local",
      "time",
      "month",
      "week",
      "image",
      "richtext",
      // Every extension-drawn type, BY CONSTRUCTION rather than by a literal
      // list that has to be remembered. Wave 4 listed "entity-reference" here
      // by hand because the reference picker is a custom control with no native
      // `required` attribute for the browser to enforce; spreading the set is
      // the same membership, plus the guarantee that the next type admitted
      // there cannot be forgotten here.
      //
      // And it must not be, for a stronger reason than "these controls happen
      // to be custom": for an extension-drawn type this component has NO
      // knowledge of what the registered module renders — Duration's control
      // does carry a native `required`, but `CustomFieldExtensionControl`'s
      // no-module-registered fallback is an inert `role="group"` div with no
      // form control in it at all. Native constraint validation therefore
      // cannot be relied on for any member, whatever today's module happens to
      // draw.
      //
      // These reach this submit path via generic-crud-view.tsx, which
      // concatenates the CustomFields extension's fieldConfigs into
      // <GenericForm>'s own `fields`.
      ...EXTENSION_DRAWN_FIELD_TYPES,
    ]);

    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      // Skip fields that aren't visible
      if (field.isVisible && !field.isVisible(formData)) return;
      // Skip fields that don't require validation
      if (!field.required) return;
      // Only validate custom component types (native inputs are validated by browser)
      if (!customTypes.has(field.type)) return;

      // Object-aware since Wave 4 -- the inline scalar/array-only expression
      // this replaced treated EVERY object as filled, so a required
      // entity-reference field with nothing picked submitted empty. See
      // `isRequiredFieldEmpty` for the full reasoning and for why no existing
      // field type's behaviour changes.
      if (isRequiredFieldEmpty(field, formData[field.name])) {
        // No `|| "English literal"` fallback: t() returns the bare key on a
        // miss, never a falsy value, so the fallback was dead code that could
        // only ever ship untranslated English.
        newErrors[field.name] = t("validation.required");
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      // Convert date fields back to ISO format for API
      const submitData = { ...formData };
      fields.forEach((field) => {
        if (
          field.type === "date" ||
          field.type === "datetime" ||
          field.type === "datetime-local" ||
          field.type === "time" ||
          field.type === "month" ||
          field.type === "week"
        ) {
          // The value is only a string when it came through the date-input
          // conversion. `initialValues` and `defaultValue` bypass that on the
          // re-init path, so a Date object or a number can land here — and
          // calling .trim() on it threw inside an async handler, which React
          // does not surface: the form just sat there while the rejection
          // escaped as an unhandled promise.
          const raw = submitData[field.name];
          const asString = typeof raw === "string" ? raw : "";
          if (asString.trim() !== "") {
            const converted = fromDateInputValue(asString);
            // Only set if conversion was successful (not empty string)
            if (converted && converted.trim() !== "") {
              submitData[field.name] = converted;
            } else {
              // Remove if conversion failed or resulted in empty
              delete submitData[field.name];
            }
          } else {
            // Remove empty strings or undefined values for date fields
            delete submitData[field.name];
          }
        }

        // A number field submitted its raw input string, so consumers received
        // "12" where the API expects 12 — and every caller had to remember to
        // coerce. Empty stays empty rather than becoming 0.
        if (field.type === "number") {
          const raw = submitData[field.name];
          if (raw !== "" && raw !== null && raw !== undefined) {
            const asNumber = Number(raw);
            if (!Number.isNaN(asNumber)) submitData[field.name] = asNumber;
          }
        }
      });
      await onSubmit(submitData);
    } catch (error) {
      // There was no catch at all. The CRUD viewmodels re-throw, so a failed
      // save escaped as an unhandled rejection and the form rendered nothing —
      // the user pressed Save, the spinner stopped, and no reason appeared.
      setServerError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const getFormSpacing = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "space-y-3";
      case "comfortable":
        return "space-y-6";
      case "spacious":
        return "space-y-8";
      default:
        return "space-y-4";
    }
  };

  const getFieldSpacing = () => {
    // Use formStyle for spacing if available, otherwise fallback to spacingSize
    const style = settings.formStyle || settings.spacingSize;
    switch (style) {
      case "compact":
        return "space-y-1";
      case "spacious":
        return "space-y-4";
      case "inline":
        return "flex items-center gap-4";
      case "modern":
        return "space-y-3";
      case "glass":
        return "space-y-3";
      case "minimal":
        return "space-y-2";
      case "card":
        return "space-y-3";
      default:
        // Handle spacingSize fallback for comfortable
        if (settings.spacingSize === "comfortable") {
          return "space-y-3";
        }
        return "space-y-2";
    }
  };

  const getGridGap = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "gap-3";
      case "comfortable":
        return "gap-6";
      case "spacious":
        return "gap-8";
      default:
        return "gap-4";
    }
  };

  const getInputHeight = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "h-9";
      case "comfortable":
        return "h-12";
      case "spacious":
        return "h-14";
      default:
        return "h-10";
    }
  };

  const getButtonSize = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "sm";
      case "comfortable":
      case "spacious":
        return "lg";
      default:
        return "default";
    }
  };

  const getSeparatorSpacing = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "pt-4 mt-4";
      case "comfortable":
        return "pt-8 mt-8";
      case "spacious":
        return "pt-10 mt-10";
      default:
        return "pt-6 mt-6";
    }
  };

  const getFormContainerClasses = () => {
    const baseClasses = "w-full max-h-[70vh] overflow-y-auto";

    switch (FORM_CONTAINER[settings.formStyle] ?? "flat") {
      case "card":
        // a real slab: hairline frame, surface fill, one radius step off the
        // ladder — no gradient, no blur, no coloured shadow
        return cn(baseClasses, "rounded-nx-lg border border-nx-line bg-nx-surface p-6");
      case "minimal":
        return cn(baseClasses, "p-4");
      default:
        return cn(baseClasses, "p-6");
    }
  };

  // Label styling belongs to the Label primitive (ink step, size ladder,
  // disabled ink). The form only decides whether a run of fields is a section.
  const getLabelClasses = () => "";

  // The field surface is Input/Textarea/Select's own business; the form only
  // hands down the height its density asks for.
  const getInputClasses = (baseInputClasses: string) => baseInputClasses;

  // Visibility and permission rules are unchanged; they run before section grouping
  const visibleFields = fields.filter((field) => {
    // Check visibility function
    if (field.isVisible && !field.isVisible(formData)) return false;
    // Check permissions
    if (field.requiredPermission && !hasPermission(field.requiredPermission)) return false;
    if (
      field.requiredPermissions &&
      field.requiredPermissions.length > 0 &&
      !hasAnyPermission(field.requiredPermissions)
    )
      return false;
    return true;
  });

  // Consecutive fields sharing a `section` render as one titled, hairline-ruled group.
  // Runs with neither section nor colSpan keep the flat single-column flow untouched.
  const fieldGroups: { section?: string; fields: FieldConfig[] }[] = [];
  visibleFields.forEach((field) => {
    const last = fieldGroups[fieldGroups.length - 1];
    if (last && last.section === field.section) {
      last.fields.push(field);
    } else {
      fieldGroups.push({ section: field.section, fields: [field] });
    }
  });

  return (
    <div className={cn(getFormContainerClasses(), "text-start")} dir={direction}>
      <form
        onSubmit={handleSubmit}
        className={getFormSpacing()}
        aria-busy={loading || undefined}
        autoComplete="off"
        data-1p-ignore="true"
        data-bwignore="true"
        data-lpignore="true"
        data-protonpass-ignore="true"
        data-dashlane-ignore="true"
      >
        {fieldGroups.map((group, groupIndex) => {
          // The two-column grid engages only when a grouped field opts in via colSpan
          const gridded = group.fields.some((f) => f.colSpan !== undefined && f.type !== "hidden");
          const renderedFields = group.fields.map((field) => {
            // Field anatomy, one shape for every type: label → control →
            // hint/error. The ids wire the control to whichever of the two it
            // actually has, so a screen reader reads the hint and the error in
            // that order and never announces an empty node.
            const hintId = field.description ? `${field.name}-hint` : undefined;
            const errorId = errors[field.name] ? `${field.name}-error` : undefined;
            // The error REPLACES the hint in the row below, so the description
            // points at whichever one is actually on screen — a dangling
            // aria-describedby is worse than none.
            const describedBy = errorId ?? hintId;
            const invalid = Boolean(errors[field.name]);
            // Read-only is NOT disabled: text fields stay focusable and
            // selectable so a value can be copied out of a view dialog, while
            // pickers and toggles (which have nothing to copy) go inert.
            const inert = field.disabled || readOnly;
            // Boolean, not the number itself — a bare `maxLength &&` would
            // render a literal 0 into the form when a caller passes 0.
            const counted = Boolean(
              field.maxLength && (!field.type || field.type === "text" || field.type === "textarea")
            );

            return field.type === "hidden" ? (
              <input
                key={field.name}
                type="hidden"
                name={field.name}
                value={formData[field.name] ?? ""}
              />
            ) : (
              <div
                key={field.name}
                className={cn("relative", getFieldSpacing(), gridded && field.colSpan === 2 && "sm:col-span-2")}
              >
                {/* Switch and checkbox label themselves on their own row.
                    Extension-drawn types are excluded because every one of
                    their controls renders its own `<Label htmlFor={name}>` over
                    its own control — verified per control, not assumed, and the
                    failure keeping this label would cause is NOT the same for
                    all three: see `EXTENSION_DRAWN_FIELD_TYPES` above for the
                    reference control's un-nameable `role="combobox"` div, for
                    Duration's doubled native `for`/`id` accessible name, and for
                    Currency's purely visual duplicate. The label is not lost: it
                    moves into whichever branch of
                    `CustomFieldExtensionControl` actually renders. */}
                {field.type !== "switch" &&
                  field.type !== "checkbox" &&
                  !EXTENSION_DRAWN_FIELD_TYPES.has(field.type) && (
                    <Label htmlFor={field.name} className={cn(getLabelClasses(), "text-start")}>
                      {field.label}
                    </Label>
                  )}
                {field.type === "select" ? (
                  <GenericSelect
                    id={field.name}
                    // Task 7b a11y fix (Wave 2 Step 2.2, T1): the trigger is a
                    // role="combobox" div, not a labelable HTML element, so
                    // the <Label htmlFor> above computes NO accessible name
                    // for it. Same `label ?? name` fallback as
                    // renderCustomFieldControl.tsx's Select branch.
                    aria-label={field.label ?? field.name}
                    invalid={invalid}
                    required={field.required}
                    describedBy={describedBy}
                    // `loading` reached only the searchable branch, so a plain
                    // select waiting on its options rendered as an empty list
                    // rather than as loading.
                    loading={field.loading}
                    type="single"
                    options={
                      field.options?.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                      })) || []
                    }
                    value={formData[field.name] ?? ""}
                    onValueChange={(value: string | string[]) =>
                      handleChange(field.name, typeof value === "string" ? value : value[0])
                    }
                    placeholder={field.placeholder}
                    disabled={inert}
                    className={getInputClasses(getInputHeight())}
                  />
                ) : field.type === "searchable-select" || field.type === "server-select" ? (
                  <GenericSelect
                    id={field.name}
                    aria-label={field.label ?? field.name}
                    invalid={invalid}
                    required={field.required}
                    describedBy={describedBy}
                    type="searchable"
                    options={
                      field.options?.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                      })) || []
                    }
                    value={formData[field.name] ?? ""}
                    onValueChange={(value: string | string[]) =>
                      handleChange(field.name, typeof value === "string" ? value : value[0])
                    }
                    placeholder={field.placeholder}
                    searchPlaceholder={field.searchPlaceholder}
                    searchType={field.searchType || "client"}
                    onServerSearch={
                      field.onServerSearch
                        ? async (query: string) => {
                            const results = await field.onServerSearch!(query);
                            return results.map((r) => ({
                              value: r.value,
                              label: r.label,
                            }));
                          }
                        : undefined
                    }
                    searchEndpoint={field.searchEndpoint}
                    debounceMs={field.debounceMs}
                    loading={field.loading}
                    noResultsText={field.noResultsText}
                    searchingText={field.searchingText}
                    disabled={inert}
                    className={getInputClasses(getInputHeight())}
                    // Stable key to avoid remounting (which closes dropdown) on each selection
                    key={`searchable-select-${field.name}`}
                  />
                ) : field.type === "multi-select" ? (
                  <GenericSelect
                    id={field.name}
                    aria-label={field.label ?? field.name}
                    invalid={invalid}
                    required={field.required}
                    describedBy={describedBy}
                    loading={field.loading}
                    type="multi"
                    options={
                      field.options?.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                        uniqueKey: opt.uniqueKey,
                      })) || []
                    }
                    value={formData[field.name] || []}
                    onValueChange={(value: string | string[]) => handleChange(field.name, value)}
                    placeholder={field.placeholder}
                    searchPlaceholder={field.searchPlaceholder}
                    searchType={field.searchType}
                    onServerSearch={
                      field.onServerSearch
                        ? async (query: string) => {
                            const results = await field.onServerSearch!(query);
                            return results.map((r) => ({
                              value: r.value,
                              label: r.label,
                              uniqueKey: r.uniqueKey,
                            }));
                          }
                        : undefined
                    }
                    searchEndpoint={field.searchEndpoint}
                    debounceMs={field.debounceMs}
                    allowClear={field.allowClear}
                    noResultsText={field.noResultsText}
                    searchingText={field.searchingText}
                    maxSelectedDisplay={3}
                    disabled={inert}
                    className={getInputClasses(getInputHeight())}
                    // Stable key to avoid remounting (which closes dropdown) on each selection
                    key={`multi-select-${field.name}`}
                  />
                ) : field.type === "tree" ? (
                  <GenericSelect
                    id={field.name}
                    aria-label={field.label ?? field.name}
                    invalid={invalid}
                    required={field.required}
                    describedBy={describedBy}
                    loading={field.loading}
                    type="tree"
                    treeData={field.treeData || []}
                    value={formData[field.name] ?? ""}
                    onValueChange={(value: string | string[]) =>
                      handleChange(field.name, typeof value === "string" ? value : value[0])
                    }
                    placeholder={field.placeholder}
                    searchPlaceholder={field.searchPlaceholder}
                    disabled={inert}
                    className={getInputClasses(getInputHeight())}
                  />
                ) : EXTENSION_DRAWN_FIELD_TYPES.has(field.type) ? (
                  // The whole field, label included, comes from the CustomFields
                  // module through the extension registry — or, when no module is
                  // registered, from the explicit inert state
                  // `CustomFieldExtensionControl` renders instead. What must never
                  // happen here is falling through to the text `<Input>` below.
                  //
                  // `formData[field.name]` is passed RAW, with no `?? ""`
                  // normalisation: the fallthrough's `?? ""` is precisely what
                  // turned an absent object value into an empty string the server
                  // then refused. Absent stays `undefined`, and the control decides
                  // what "no value" means for its own type — which for Currency is
                  // `null` (both pieces blank) and for Duration is `""`, two
                  // different answers that only the controls can give.
                  <CustomFieldExtensionControl
                    field={field}
                    value={formData[field.name]}
                    onChange={(next) => handleChange(field.name, next)}
                    disabled={inert}
                    invalid={invalid}
                    describedBy={describedBy}
                  />
                ) : field.type === "bilingual-options" ? (
                  <BilingualOptionsEditor
                    id={field.name}
                    value={formData[field.name] ?? ""}
                    valueAr={field.pairedName ? (formData[field.pairedName] ?? "") : ""}
                    // Writes BOTH halves in one update. handleChange merges an object returned by
                    // the field's own onChange, so the paired key travels with the primary one and
                    // the two lists can never be persisted out of step.
                    onChange={(next) =>
                      handleChange(
                        field.name,
                        next.en,
                        field.pairedName ? { [field.pairedName]: next.ar } : undefined
                      )
                    }
                    disabled={field.disabled || inert}
                    readOnly={readOnly}
                    labelEn={field.placeholder ?? "English"}
                    labelAr={field.searchPlaceholder ?? "العربية"}
                    addLabel={field.addLabel ?? "Add option"}
                    removeLabel={field.removeLabel ?? "Remove"}
                    emptyHint={field.emptyHint ?? ""}
                  />
                ) : field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    value={formData[field.name] ?? ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className={cn(getInputClasses("min-h-20"), "text-start")}
                    placeholder={field.placeholder}
                    rows={field.rows || 4}
                    disabled={field.disabled}
                    readOnly={readOnly}
                    minLength={field.minLength}
                    maxLength={field.maxLength}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    dir={direction}
                  />
                ) : field.type === "richtext" ? (
                  <RichTextEditor
                    value={formData[field.name] ?? ""}
                    onChange={(value) => handleChange(field.name, value)}
                    placeholder={field.placeholder}
                    // TipTap editor exposes readOnly (not disabled); honour both the
                    // per-field flag and the form-level read-only mode
                    readOnly={field.disabled || readOnly}
                    // px string — the editor feeds this into a CSS custom property
                    minHeight={field.rows ? `${field.rows * 20}px` : "200px"}
                    className="text-start"
                  />
                ) : field.type === "switch" ? (
                  // A switch labels itself on the row; the hint lands in the
                  // shared row below, like every other field type.
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor={field.name} className="text-start">
                      {field.label}
                    </Label>
                    <Switch
                      id={field.name}
                      checked={formData[field.name] || false}
                      onCheckedChange={(checked) => handleChange(field.name, checked)}
                      disabled={inert}
                      aria-describedby={describedBy}
                    />
                  </div>
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={field.name}
                      checked={formData[field.name] || false}
                      onCheckedChange={(checked) => handleChange(field.name, checked)}
                      disabled={inert}
                      design={settings.checkboxStyle}
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                    />
                    <Label htmlFor={field.name} className="cursor-pointer text-start">
                      {field.label}
                    </Label>
                  </div>
                ) : field.type === "radio" ? (
                  <RadioGroup
                    value={formData[field.name] ?? ""}
                    onValueChange={(value) => handleChange(field.name, value)}
                    disabled={inert}
                    design={settings.radioStyle}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                  >
                    {field.options?.map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={option.value}
                          id={`${field.name}-${option.value}`}
                          design={settings.radioStyle}
                        />
                        <Label
                          htmlFor={`${field.name}-${option.value}`}
                          className="cursor-pointer text-start"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : field.type === "slider" || field.type === "range" ? (
                  <div className="space-y-2">
                    <Slider
                      value={[formData[field.name] ?? field.min ?? 0]}
                      onValueChange={(value) => handleChange(field.name, value[0])}
                      min={Number(field.min) || 0}
                      max={Number(field.max) || 100}
                      step={Number(field.step) || 1}
                      disabled={inert}
                      className="w-full"
                      aria-describedby={describedBy}
                    />
                    {/* the read-out is data: tertiary ink, tabular figures so
                        the number stops jittering as it counts */}
                    <div className="flex items-baseline justify-between text-xs text-nx-ink-3">
                      <span>{t("common.value")}</span>
                      <span className="font-medium tabular-nums text-nx-ink-2">
                        {formData[field.name] ?? field.min ?? 0}
                      </span>
                    </div>
                  </div>
                ) : field.type === "date" ||
                  field.type === "datetime" ||
                  field.type === "datetime-local" ||
                  field.type === "time" ||
                  field.type === "month" ||
                  field.type === "week" ? (
                  <DatePicker
                    id={field.name}
                    type={field.type === "datetime" ? "datetime-local" : (field.type as any)}
                    value={formData[field.name] ?? ""}
                    onChange={(value) => handleChange(field.name, value)}
                    required={field.required}
                    className={getInputClasses(getInputHeight())}
                    placeholder={field.placeholder}
                    disabled={inert}
                  />
                ) : field.type === "image" ? (
                  <ImageUploader
                    id={field.name}
                    value={formData[field.name] ?? ""}
                    onChange={(base64) => handleChange(field.name, base64)}
                    onRemove={() => handleChange(field.name, "")}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={inert}
                    className={getInputClasses(getInputHeight())}
                    accept={field.accept || "image/*"}
                    maxSize={field.maxSize}
                    showPreview={field.showPreview !== false}
                    aspectRatio={field.aspectRatio}
                  />
                ) : field.type === "file" ? (
                  <Input
                    id={field.name}
                    type="file"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (field.multiple) {
                        handleChange(field.name, files ? Array.from(files) : []);
                      } else {
                        handleChange(field.name, files?.[0] || null);
                      }
                    }}
                    required={field.required}
                    className={cn(getInputClasses(getInputHeight()), "text-start")}
                    accept={field.accept}
                    multiple={field.multiple}
                    disabled={inert}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    dir={direction}
                  />
                ) : field.type === "password" ? (
                  <div className="relative w-full overflow-hidden rounded-nx-control">
                    <PasswordInput
                      id={field.name}
                      value={formData[field.name] ?? ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      className={cn(getInputClasses(getInputHeight()), "text-start")}
                      placeholder={field.placeholder}
                      disabled={field.disabled}
                      readOnly={readOnly}
                      autoComplete={field.autoComplete ?? "new-password"}
                      data-1p-ignore="true"
                      data-bwignore="true"
                      data-lpignore="true"
                      data-protonpass-ignore="true"
                      data-dashlane-ignore="true"
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                      showStrengthIndicator={true} // Enable for admin forms
                    />
                  </div>
                ) : (
                  <div className="relative w-full overflow-hidden rounded-nx-control">
                    <Input
                      id={field.name}
                      type={field.type}
                      value={formData[field.name] ?? ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      className={cn(getInputClasses(getInputHeight()), "text-start")}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      pattern={field.pattern}
                      minLength={field.minLength}
                      maxLength={field.maxLength}
                      disabled={field.disabled}
                      readOnly={readOnly}
                      autoComplete={field.autoComplete ?? "off"}
                      data-1p-ignore="true"
                      data-bwignore="true"
                      data-lpignore="true"
                      data-protonpass-ignore="true"
                      data-dashlane-ignore="true"
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                      dir={direction}
                    />
                  </div>
                )}

                {/* Hint and error share one row with the character counter, so
                    the block never jumps as messages come and go. The hint is
                    always available (it used to render for switches only); the
                    error replaces it when the field goes invalid. */}
                {(field.description || errors[field.name] || counted) && (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {errors[field.name] ? (
                        <p id={errorId} className="text-xs font-medium text-nx-danger">
                          {errors[field.name]}
                        </p>
                      ) : field.description ? (
                        <p id={hintId} className="text-xs leading-relaxed text-nx-ink-3">
                          {field.description}
                        </p>
                      ) : null}
                    </div>
                    {counted && (
                      <span className="shrink-0 text-xs tabular-nums text-nx-ink-3">
                        {(formData[field.name] ?? "").length}/{field.maxLength}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          });

          // Position-based key: a legacy flat form is always one group ("flat:0"),
          // so reconciliation stays identical to the pre-section render
          const groupKey = `${group.section ?? "flat"}:${groupIndex}`;

          // Absent section and colSpan = exactly the legacy flat single-column flow
          if (!group.section && !gridded) {
            return <React.Fragment key={groupKey}>{renderedFields}</React.Fragment>;
          }

          return (
            <section key={groupKey} className="space-y-3">
              {group.section && (
                <h3 className="border-b border-nx-line pb-2 text-sm font-medium text-nx-ink">
                  {group.section}
                </h3>
              )}
              <div
                className={
                  gridded
                    ? cn("grid grid-cols-1 items-start sm:grid-cols-2", getGridGap())
                    : getFormSpacing()
                }
              >
                {renderedFields}
              </div>
            </section>
          );
        })}

        {serverError && (
          <div role="alert" className="pt-2">
            <ErrorMessage message={serverError} size="sm" />
          </div>
        )}

        <Separator />

        {/* Actions read in DOM order (cancel, then save) and the row is
            reversed once so the primary always lands on the inline END — no
            per-direction order forks, and no gradient on the submit: Button
            owns its own paint. */}
        {!readOnly && (
          <div
            className={cn(
              "flex flex-col-reverse sm:flex-row sm:justify-end",
              getGridGap(),
              getSeparatorSpacing()
            )}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className={getInputHeight()}
              disabled={loading}
              size={getButtonSize()}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              loading={loading}
              className={getInputHeight()}
              size={getButtonSize()}
            >
              {t("common.save")}
            </Button>
          </div>
        )}
        {readOnly && (
          <div className={cn("flex justify-center", getSeparatorSpacing())}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className={getInputHeight()}
              size={getButtonSize()}
            >
              {t("common.close")}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
