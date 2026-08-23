/**
 * CustomField value-type catalog -- Wave 2 Step 2.2.
 *
 * Single source of truth for the per-value-type presentation metadata that
 * today is hardcoded independently in multiple places:
 * - VALUE_TYPE_VARIANTS, NO_PLACEHOLDER_VALUE_TYPES, valueTypeOptions/
 *   valueTypeLabels (CustomFieldListView.tsx)
 * - the same shapes, independently re-declared, in InlineAddCustomFieldDialog.tsx
 * - VALUE_TYPE_TO_FIELD_TYPE (customFieldsCrudIntegration.tsx)
 *
 * This module only DEFINES the catalog. No consumer is rewired yet -- that is
 * later work in this same plan. Every value below is a byte-identical
 * restatement of the current hardcoded behavior in those files (re-verified
 * against real source, not copied from a stale design doc), not a redesign.
 *
 * Lives in `presentation/registries/` with the submodule's two other pure-data
 * lookup tables (validatorKindRegistry, entityScreenManifest). Nothing in that
 * folder renders: it is Record<EnumValue, Metadata> data plus the contract tests
 * that pin it to the backend enums, which is why it is kept apart from the
 * controls that consume it (`presentation/controls/`), the form pieces that
 * dispatch on it (`presentation/form/`) and the screens that browse it
 * (`presentation/views/`). Its structural precedent in this codebase is
 * subscriptions' `presentation/constants.ts` (STATUS_VARIANTS/TYPE_VARIANTS),
 * signin's `presentation/components/layouts/index.ts` (LAYOUT_REGISTRY) and
 * settings' `settings-nav.tsx` (GROUP_PANELS) -- a lookup table sitting beside
 * its module's other presentation code rather than in the domain layer.
 *
 * External consumers do not import this path. They import the value-type
 * vocabulary from the submodule barrel, which is what lets this folder be
 * reorganised without touching them.
 */
import type { FieldConfig } from "@core/ui/forms/generic-form";

/**
 * Mirrors CustomFields.Domain.Enums.CustomFieldValueType's wire names.
 * Re-exported from the custom-field-value submodule's canonical definition
 * (CustomFieldValueModel.ts) rather than redeclared -- this submodule and
 * custom-field-value are both part of the single `custom-fields` module (one
 * shared di.ts/index.ts, see modules/custom-fields/custom-fields/di.ts), so
 * importing across them is not the "Module A importing from Module B" the
 * architecture doc forbids between top-level modules; it is a same-module,
 * cross-submodule import.
 */
export type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";

import type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";

/**
 * Badge tone for this type in read-only/admin contexts. Matches
 * VALUE_TYPE_VARIANTS's existing value union exactly
 * (CustomFieldListView.tsx:37-40).
 */
export type ValueTypeBadgeVariant = "default" | "secondary" | "info" | "success" | "warning";

/**
 * Rating's 1-5 ceiling (Wave 3.2 Batch 3, backend ruling R2) -- a code-owned
 * constant mirroring `RatingValueTypeHandler.MinRating`/`MaxRating`
 * byte-for-byte, the same "no per-field config knob" precedent
 * `MULTI_SELECT_MAX_SELECTIONS` (MultiSelectCustomFieldControl.tsx) and
 * `LONG_TEXT_MAX_CHARACTERS` (LongTextCustomFieldControl.tsx) already set.
 * Lives here, not in a dedicated Rating control file (R6: no new component
 * was needed -- Rating reuses `@core/ui/slider.tsx` directly), because both
 * the write side (renderCustomFieldControl.tsx's "slider" branch) and the
 * read side (formatCustomFieldValue.tsx's "Rating" case, "N / 5") need the
 * SAME number and this catalog module is the one file both already import
 * from -- a pure-data home, matching this file's own "mirrors the backend's
 * pure-data ValueTypeDescriptor" convention (see this file's own header
 * comment) rather than one presentation file reaching into another's
 * component-heavy module just for a constant.
 */
export const RATING_MIN = 1;
export const RATING_MAX = 5;

/**
 * RichText's 50,000-character ceiling (Wave 3.4) -- a code-owned constant
 * mirroring `RichTextValueTypeHandler.MaxRichTextLength` byte-for-byte, with no
 * per-field config knob, exactly like `RATING_MAX` above.
 *
 * MEASURED ON THE RAW MARKUP, not the visible words, because that is what the
 * server measures and where it measures it: the handler caps the input BEFORE
 * sanitizing, since handing an unbounded body to an HTML parser is the denial of
 * service and the cap is the mitigation. Counting the same string on this side is
 * what makes the limit predictable for the operator -- sanitizing shrinks the
 * value by an amount that depends on what the allowlist trimmed, so a cap
 * measured after would be un-anticipatable. Five times LongText's 10,000 on the
 * same `ValueLongText` column, for that handler's stated reason: a paragraph of
 * prose carries tags, and the operator's mental budget is the words.
 *
 * IT LIVES HERE RATHER THAN IN `RichTextCustomFieldControl`, which is where
 * `LONG_TEXT_MAX_CHARACTERS` and `MULTI_SELECT_MAX_SELECTIONS` each live -- and
 * the departure is deliberate, for the reason `RATING_MIN`/`RATING_MAX` are here
 * too, plus one that is specific to this type. Two files need the number: the
 * control and `customFieldValueValidation.ts`. That validator module is imported
 * by all nine consumer save flows for `assertSelectCustomFieldValuesValid`, and
 * importing the constant from the control would pull the CONTROL into every one
 * of them -- which now means pulling TipTap and its ~15 editor packages into nine
 * viewmodels that never render an editor. This module is pure data with no React
 * import at all, so it is the one home both sides can reach for free. (The
 * renderer still imports the control, unavoidably: it has to draw it.)
 */
export const RICH_TEXT_MAX_CHARACTERS = 50_000;

export interface ValueTypeCatalogEntry {
  /**
   * The FieldConfig["type"] this value type maps to for editing -- identical
   * to VALUE_TYPE_TO_FIELD_TYPE's existing values
   * (customFieldsCrudIntegration.tsx:15-21), ported verbatim, not reinvented.
   */
  fieldConfigType: FieldConfig["type"];
  /** Badge tone shown in the definitions-admin list (CustomFieldListView.tsx:37-46, 158-162). */
  badgeVariant: ValueTypeBadgeVariant;
  /**
   * Whether this type has a placeholder concept (false for Boolean/Date --
   * ported verbatim from NO_PLACEHOLDER_VALUE_TYPES, CustomFieldListView.tsx:32,
   * inverted).
   */
  hasPlaceholder: boolean;
  /** Whether this type owns an Options list (true only for Select, CustomFieldListView.tsx:27, 250-251, 337-338). */
  hasOptions: boolean;
  /**
   * i18n key for this type's display label, under the customField.valueTypes.*
   * namespace already established (custom-field.en.ts:54-59, custom-field.ar.ts:53-58).
   */
  labelKey: string;
}

/**
 * Wave 2 Step 2.4, D3: `Record<CustomFieldValueTypeName, ...>` types as TOTAL
 * over the 5 known members, but nothing at the wire boundary actually
 * guarantees a real `data.valueType`/`form.valueType`/row `value` IS one of
 * them (this catalog's own consumers already document that gap -- see
 * customFieldsCrudIntegration.tsx's `mapValueToFieldConfig` comment on the I1
 * fix). Indexing this Record directly with a value that only TypeScript
 * *believes* is a `CustomFieldValueTypeName` compiles clean and gives no
 * warning, but throws at runtime the moment it's wrong (`Cannot read
 * properties of undefined`) unless the call site remembers its own explicit
 * `?.` guard -- an easy, silent thing to forget, and exactly the bug I1 was.
 *
 * For anything touching real/wire data (a value decoded from an API
 * response, unvalidated form state, a table row) prefer
 * `getValueTypeCatalogEntry(type)` below instead of `VALUE_TYPE_CATALOG[type]`
 * -- it takes a plain `string`, so there is no union-typed value to
 * mistakenly trust, and returns `undefined` (not a crash) on a miss, forcing
 * the caller to handle the fallback explicitly.
 *
 * Direct `VALUE_TYPE_CATALOG[type]` indexing stays fine, and does not need to
 * change, for call sites iterating the compile-time `ALL_VALUE_TYPES` array
 * itself (e.g. building a Select's own option list) -- `type` there is
 * genuinely guaranteed to be a real member, not a guess about external data.
 */
export const VALUE_TYPE_CATALOG: Record<CustomFieldValueTypeName, ValueTypeCatalogEntry> = {
  Text: {
    fieldConfigType: "text",
    badgeVariant: "secondary",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.text",
  },
  Number: {
    fieldConfigType: "number",
    badgeVariant: "info",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.number",
  },
  Boolean: {
    fieldConfigType: "switch",
    badgeVariant: "success",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.boolean",
  },
  Date: {
    fieldConfigType: "date",
    badgeVariant: "warning",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.date",
  },
  Select: {
    fieldConfigType: "select",
    badgeVariant: "default",
    hasPlaceholder: true,
    hasOptions: true,
    labelKey: "customField.valueTypes.select",
  },
  /**
   * Wave 3.1 Task 5/10 (ruling R8). Byte-identical to
   * LongTextValueTypeHandler.Descriptor on the backend (that handler's own
   * doc comment says so explicitly) -- a genuinely separate capability from
   * Text (its own ValueLongText column, no HasMaxLength), not a taller
   * textarea over the same 4000-char column, even though the two share
   * `hasPlaceholder`/`badgeVariant` here.
   */
  LongText: {
    fieldConfigType: "textarea",
    badgeVariant: "secondary",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.longText",
  },
  /**
   * Wave 3.1 Task 7/10 (ruling R7). Byte-identical to
   * DateTimeValueTypeHandler.Descriptor on the backend. `hasPlaceholder:
   * false` is deliberate, not the same value Date/Boolean happen to share
   * for unrelated reasons -- a DateTime value is a two-piece (instant +
   * zone) object, and there is no single text placeholder concept for it.
   * `fieldConfigType: "datetime"` is an existing FieldConfig["type"]
   * (generic-form.tsx maps it onto an HTML `datetime-local` input), not a
   * new frontend concept invented for this type.
   */
  DateTime: {
    fieldConfigType: "datetime",
    badgeVariant: "warning",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.dateTime",
  },
  /**
   * Wave 3.1 Task 8/10 (rulings R5, R9). Byte-identical to
   * MultiSelectValueTypeHandler.Descriptor on the backend. `hasOptions:
   * true` puts MultiSelect in the same options-owning family as Select for
   * every catalog-driven guard below (the admin form's Options textarea
   * visibility, `SelectOptionsOwnership`'s backend twin) -- it is the
   * SECOND type this capability flag was built to generalize for (Wave 3.1
   * Task 4), not a special case bolted on here. `hasPlaceholder: true`
   * because the same GenericSelect component this renders through already
   * has a placeholder concept in its multi mode.
   */
  MultiSelect: {
    fieldConfigType: "multi-select",
    badgeVariant: "default",
    hasPlaceholder: true,
    hasOptions: true,
    labelKey: "customField.valueTypes.multiSelect",
  },
  /**
   * Wave 3.2 Batch 3 (backend rulings R1/R4, this batch's own R6). Byte-
   * identical to EmailValueTypeHandler.Descriptor's HasOptions/HasPlaceholder
   * on the backend (Batch 1's own report: ExpectedHasOptions false,
   * ExpectedHasPlaceholder true). `fieldConfigType: "email"` is an existing
   * FieldConfig["type"] (generic-form.tsx already maps it onto a native
   * `type="email"` input) reused verbatim, not invented -- same "reuse a real
   * frontend concept" rule every prior wave has followed.
   */
  Email: {
    fieldConfigType: "email",
    badgeVariant: "secondary",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.email",
  },
  /**
   * Wave 3.2 Batch 3 (backend ruling R4 -- the wave's one genuine security
   * ruling: http/https allowlisted at WRITE time, everything else 422s).
   * Byte-identical to UrlValueTypeHandler.Descriptor
   * (ExpectedHasOptions/ExpectedHasPlaceholder, Batch 1's own report).
   * `fieldConfigType: "url"` is likewise an existing, reused FieldConfig type.
   */
  Url: {
    fieldConfigType: "url",
    badgeVariant: "secondary",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.url",
  },
  /**
   * Wave 3.2 Batch 3 (backend ruling R3 -- ValueText stores canonical E.164,
   * no region column; the frontend's own PhoneInput, `core/ui/phone-input.tsx`,
   * derives the flag/region for display from the number itself, matching the
   * backend's identical choice). Byte-identical to
   * PhoneValueTypeHandler.Descriptor. `fieldConfigType: "tel"` is the existing
   * FieldConfig["type"] this batch wires PhoneInput to for the first time --
   * see renderCustomFieldControl.tsx's own "tel" branch for why `id` genuinely
   * binds an accessible name here (verified against PhoneInput's real source,
   * not assumed).
   */
  Phone: {
    fieldConfigType: "tel",
    badgeVariant: "secondary",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.phone",
  },
  /**
   * Wave 3.2 Batch 3 (backend ruling R5 -- PD-2's storage/display disagreement
   * reappearing at the formatting layer; see formatCustomFieldValue.tsx's own
   * "Percent" case for the fix and the pinning test). `fieldConfigType:
   * "number"` is DELIBERATE, not a placeholder -- PercentValueTypeHandler's
   * own Batch 2 report: "Percent's write surface is honestly just a numeric
   * input constrained 0-100 by Validate -- the same shape Number already
   * renders through." Reusing "number" means this type needs NO new
   * renderCustomFieldControl.tsx branch at all (the existing shared Input
   * fallthrough already renders `type="number"` correctly for it, the exact
   * same code path Number itself already exercises) -- only its OWN
   * formatCustomFieldValue.tsx case, since read-side formatting is keyed by
   * valueType, not fieldConfigType. `hasPlaceholder: true` matches Number's
   * own value (Batch 2's report, `ExpectedHasPlaceholder: Percent: true`).
   */
  Percent: {
    fieldConfigType: "number",
    badgeVariant: "info",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.percent",
  },
  /**
   * Wave 3.2 Batch 3 (backend ruling R2 -- an integer 1-5, 5 a hardcoded
   * handler constant, 0 explicitly invalid/not "unrated"). `fieldConfigType:
   * "slider"` is the natural fit for a small discrete scale and reuses the
   * existing, mature `@core/ui/slider.tsx` (Radix) -- already an existing
   * FieldConfig["type"], and the same value Wave 3.1 Task 10's own probe used
   * as its hypothetical 9th type precisely because it was a real
   * FieldConfig["type"] with NO dedicated renderCustomFieldControl.tsx branch
   * yet (that probe predicted this exact type would need real wiring, not
   * ride any existing fallback). `hasPlaceholder: false` mirrors Batch 2's own
   * mid-implementation correction (checked generic-form.tsx's real "slider"
   * branch and `slider.tsx` directly: Radix's Slider has no placeholder
   * concept at all) -- not assumed true-by-default the way DateTime's own
   * identity-formula mistake was originally made and caught.
   */
  Rating: {
    fieldConfigType: "slider",
    badgeVariant: "warning",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.rating",
  },
  /**
   * Wave 3.3 Batch C (backend rulings R1/R2). `fieldConfigType: "currency"`
   * is a genuinely NEW dispatch key, not a reuse of the backend Descriptor's
   * own `FieldConfigType: "number"` -- that backend string is never
   * transmitted over the wire (EntityCustomFieldValueData carries only
   * `valueType`), so there is no cross-system contract requiring this
   * catalog to match it, and reusing "number" here would make Currency
   * indistinguishable from Number/Percent/Duration inside
   * renderCustomFieldControl's own dispatch, which needs to render a
   * genuinely different (paired amount + code) control -- see
   * CurrencyCustomFieldControl.tsx's own header comment. `hasPlaceholder:
   * true` matches the backend Descriptor's own value (the amount is a typed
   * numeric input, same placeholder concept as Number/Percent).
   */
  Currency: {
    fieldConfigType: "currency",
    badgeVariant: "info",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.currency",
  },
  /**
   * Wave 3.3 Batch C (backend ruling R4). `fieldConfigType: "duration"` is
   * likewise a new dispatch key rather than the backend Descriptor's reused
   * `"number"` -- see DurationCustomFieldControl.tsx's own header comment
   * for why a dedicated key is required here too (the unit annotation must
   * not silently apply to every other Number-shaped field sharing "number").
   * `hasPlaceholder: true` matches the backend's own
   * `ExpectedHasPlaceholder[Duration] = true` (Task B's report).
   */
  Duration: {
    fieldConfigType: "duration",
    badgeVariant: "info",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.duration",
  },
  /**
   * Wave 3.3 Batch C (backend ruling R3, this batch's own R6). `"time"` is
   * NOT a new FieldConfig["type"] member -- it already existed
   * (generic-form.tsx), but as a declared-and-mis-routed trap (R6: GenericForm
   * sends it through DatePicker via an `as any` cast onto a `type` prop that
   * only declares "date" | "datetime-local"). Reused here deliberately,
   * honestly, because renderCustomFieldControl.tsx now has a REAL dedicated
   * "time" branch (a real `<input type="time" step={1}>` via the shared
   * Input primitive) that never touches DatePicker/GenericForm's broken
   * path at all. `hasPlaceholder: false` matches the backend's own
   * `ExpectedHasPlaceholder[Time] = false` (Task B's report) -- a time value
   * has no single free-text placeholder concept the way Number/Text do.
   */
  Time: {
    fieldConfigType: "time",
    badgeVariant: "warning",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.time",
  },
  /**
   * Wave 3.3 Batch C (backend ruling R5). `"color"` already existed in
   * FieldConfig["type"] too, declared but unbranched (fell through to a bare
   * native `<input type="color">` via this file's shared fallthrough --
   * no hex entry, no presets). Now wired to the generalized
   * `ColorPickerField` (see renderCustomFieldControl.tsx's own "color"
   * branch). `hasPlaceholder: false` matches the backend's own
   * `ExpectedHasPlaceholder[Color] = false` (Task B's report) -- a swatch
   * picker has no free-text placeholder concept.
   */
  Color: {
    fieldConfigType: "color",
    badgeVariant: "secondary",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.color",
  },
  /**
   * Wave 4. A field on one record holding the (encrypted) id of a record in
   * another table.
   *
   * `fieldConfigType: "entity-reference"` is a genuinely NEW dispatch key and
   * deliberately NOT the backend Descriptor's own `FieldConfigType:
   * "server-select"`. That backend string is never transmitted (the wire's
   * `EntityCustomFieldValueData` carries only `valueType`), so there is no
   * cross-system contract to honour here -- the same reasoning Currency and
   * Duration already used to decline the backend's reused `"number"`. And
   * reusing `"server-select"` would be actively wrong rather than merely
   * lossy: that member is threaded through `GenericSelect`'s searchable mode
   * (generic-form.tsx), whose whole contract is a flat `FieldOption[]` of
   * `{ value, label }` pairs. A reference has no label to put in one -- the
   * target's name is NOT stored and cannot be resolved synchronously (see
   * `CustomFieldEntityReferenceValue`'s own doc comment), so every option
   * would have to be fetched, permission-checked and resolved per keystroke
   * through a control that assumes it already holds its options. The read
   * value is also a two-piece object, not the single string
   * `onValueChange` emits. A dedicated key keeps this type distinguishable
   * inside renderCustomFieldControl's dispatch, which is what lets it reach a
   * control that actually resolves names.
   *
   * `hasOptions: false` is load-bearing, not incidental -- it is the frontend
   * twin of the backend Descriptor's own load-bearing false. The definition-
   * level "which entity type may this field point at" pin
   * (`CustomField.ReferenceTargetEntityTypeKey`) is a target constraint, NOT
   * an option list, and modelling it as one would route this type through
   * every Select-shaped options path in the module.
   *
   * `hasPlaceholder: true` matches the backend Descriptor: the control is a
   * search box, and a search box has a placeholder ("Search employees...").
   *
   * `badgeVariant: "default"` -- same value the backend Descriptor picks, and
   * shared with Select/MultiSelect on purpose: this is the same PICKER family
   * (a search-and-choose control over server-supplied candidates), and badge
   * variants carry family, not identity. They are explicitly not required to
   * be unique -- Text/LongText/Email/Url/Phone/Color already share
   * "secondary", and Number/Percent/Currency/Duration already share "info".
   */
  EntityReference: {
    fieldConfigType: "entity-reference",
    badgeVariant: "default",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.entityReference",
  },
  /**
   * Wave 4. A reference to a person who can log in -- "assigned to",
   * "reviewed by". Identical to EntityReference above in every catalog field
   * except its label key, exactly as the backend's own
   * `UserReferenceValueTypeHandler.Descriptor` is identical to its base's
   * except for the label.
   *
   * The two types share `fieldConfigType` because they differ in WHICH target
   * key is offered, which is data, not a control kind -- UserReference's
   * target is a code-owned allowlist of exactly one key (`identity.user`;
   * `identity.admin` is excluded because `Admin.TenantId` is nullable, so an
   * admin row can sit outside every tenant filter), while EntityReference's
   * comes from the definition's own pin. One control, two data sources. A
   * separate `"user-select"` dispatch key would be the "declare a type
   * nothing renders" trap the backend Descriptor's own comment warns about,
   * reproduced on this side of the wire.
   */
  UserReference: {
    fieldConfigType: "entity-reference",
    badgeVariant: "default",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.userReference",
  },
  /**
   * Wave 3.4. A field holding one uploaded file -- "signed waiver", "medical
   * certificate". Every value below is a byte-for-byte restatement of
   * `FileValueTypeHandler.Descriptor` (BadgeVariant "default",
   * HasPlaceholder false, HasOptions false, FieldConfigType "media-file"),
   * read off that file rather than inferred from the reference family it
   * inherits from -- which matters, because ONE of those four is where it
   * departs from the family.
   *
   * `hasPlaceholder: false` is that departure, and it is the backend's own.
   * EntityReference and UserReference declare true because their control
   * genuinely is a search box and a search box has a placeholder; a media
   * reference has no free text to prompt for, so declaring true would put a
   * placeholder column in the admin catalog that nothing consumes.
   *
   * `fieldConfigType: "media-file"` is a NEW `FieldConfig["type"]` member, and
   * deliberately not that union's EXISTING `"file"` member. This is the one
   * place where "reuse a real frontend concept" -- the rule Percent and
   * Duration followed onto `"number"` -- gives the wrong answer, so the
   * distinction is spelled out: reuse is right when the existing control
   * produces the right VALUE SHAPE, and only then. `"file"` is drawn by
   * GenericForm's own switch as `<Input type="file">`, whose value is a browser
   * `File` object; a media reference's value is `{ entityTypeKey, entityId }`.
   * Pointing at `"file"` would render a control that produces a shape the write
   * path 422s, on all ~30 CrudConfig screens where the core form draws custom
   * fields itself -- the exact defect `"entity-reference"` was added to fix.
   * Verified against generic-form.tsx's real render arms, not assumed.
   *
   * Reusing `"entity-reference"` instead would be wrong for a different reason:
   * that key reaches a name-resolving picker over the whole target type, which
   * for `media.file` offers every readable media row including tenant-global
   * ones -- i.e. it systematically offers the picks the backend's owner-pair
   * fence then refuses. See `MediaReferenceCustomFieldControl.tsx`.
   */
  File: {
    fieldConfigType: "media-file",
    badgeVariant: "default",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.file",
  },
  /**
   * Wave 3.4. A file constrained to an image -- "profile photo", "kit design".
   * Byte-for-byte `ImageValueTypeHandler.Descriptor`, which is identical to
   * File's above except the label key, exactly as the two handlers are.
   *
   * A SEPARATE `fieldConfigType` FROM FILE'S, and the precedent is
   * Select/MultiSelect rather than EntityReference/UserReference. Those two
   * reference types can share one key because what differs between them (which
   * target type the picker searches) arrives on another property the control
   * already reads. Nothing carries the image-only restriction: BOTH media types
   * pin the same target key `media.file`, so a shared key would leave the
   * control unable to tell an Image field from a File field at all, and the
   * image-only constraint would be literally inexpressible in the branch --
   * `renderCustomFieldControl`'s UserReference comment records that exact
   * limitation for the pair that does share a key. Two keys can still route to
   * one component with a differing prop, which is what `"select"` and
   * `"multi-select"` already do over one `GenericSelect`.
   *
   * Not `"image"`, for File's reason: that member exists and is drawn by
   * GenericForm's own switch through `ImageUploader`, whose value is a base64
   * STRING.
   */
  Image: {
    fieldConfigType: "media-image",
    badgeVariant: "default",
    hasPlaceholder: false,
    hasOptions: false,
    labelKey: "customField.valueTypes.image",
  },
  /**
   * Wave 3.4. Formatted prose authored in the product's own editor -- a
   * coaching note with paragraphs and a list, a policy blurb with a link. Byte-
   * for-byte `RichTextValueTypeHandler.Descriptor`.
   *
   * `badgeVariant: "secondary"` puts it in the text family with Text, LongText,
   * Email, Url and Phone, which is what it is: a longer piece of writing.
   * `hasPlaceholder: true` follows LongText -- an editor prompts an empty field
   * the same way a textarea does, and `RichTextEditor` takes a real
   * `placeholder` prop. `hasOptions: false` -- markup is not an option list.
   *
   * `fieldConfigType: "rich-text"` is a NEW member and deliberately NOT the
   * union's existing `"richtext"`. This one is the sharpest version of the
   * value-shape trap above, because `"richtext"` really does render a rich-text
   * editor, so it looks like exactly the reuse this catalog keeps preferring.
   * It is drawn by GenericForm's own switch, and that arm reads and writes a
   * BARE STRING (`value={formData[field.name] ?? ""}`, `onChange={(value) =>
   * handleChange(field.name, value)}`) -- the one shape this value type
   * refuses, because `InputSanitizationMiddleware`'s carve-out for the values
   * route is the PATH `values.*.html`, so a bare string arrives tag-stripped
   * and would be stored with its markup deleted. `"richtext"` is also absent
   * from `EXTENSION_DRAWN_FIELD_TYPES`, and a shipped test
   * (generic-form.requiredObjectValue.test.tsx) pins its current
   * every-object-is-filled required behaviour, so admitting it there would
   * change a shipped type as a side effect. A new key changes nothing that
   * exists.
   */
  RichText: {
    fieldConfigType: "rich-text",
    badgeVariant: "secondary",
    hasPlaceholder: true,
    hasOptions: false,
    labelKey: "customField.valueTypes.richText",
  },
};

/**
 * Wave 2 Step 2.4, D3: the safe-lookup counterpart to `VALUE_TYPE_CATALOG[...]`
 * for real/wire data. Takes a plain `string` on purpose, not the narrow
 * `CustomFieldValueTypeName` union -- the entire point is defending against a
 * value that ISN'T guaranteed to be a real union member (an unrecognized
 * `valueType` a future backend type ships before this catalog knows about
 * it), which a `CustomFieldValueTypeName`-typed parameter would let the
 * caller assume away instead of handle. Returns `undefined` on a miss --
 * never throws, never widens to `any` -- so the caller's own `??`/optional-
 * chaining fallback (the same discipline `mapValueToFieldConfig` and
 * `CustomFieldListView.tsx` already hand-apply at every wire-data call site
 * today) is enforced by the return type itself rather than left to be
 * remembered.
 */
export function getValueTypeCatalogEntry(type: string): ValueTypeCatalogEntry | undefined {
  return VALUE_TYPE_CATALOG[type as CustomFieldValueTypeName];
}

/**
 * All 22 known type names, in the same fixed display order used everywhere
 * else in this module (CustomFieldListView.tsx's valueTypeOptions,
 * InlineAddCustomFieldDialog.tsx) -- and matching
 * CustomFieldValueType's own backend declaration order (Text=0 ..
 * RichText=21), so the type picker's option order reads the same as the
 * enum's shipped history rather than an arbitrary regrouping. Wave 3.2 Batch 3
 * appended Email/Url/Phone/Percent/Rating (8-12); Wave 3.3 Batch C appended
 * Currency/Duration/Time/Color (13-16); Wave 4 appended EntityReference (17)
 * and UserReference (18); Wave 3.4 appends File (19), Image (20) and RichText
 * (21) -- each read off the real backend enum in that order rather than
 * assumed to be the next free numbers.
 *
 * THIS ARRAY IS THE ONE PLACE TYPESCRIPT CANNOT CHECK. `VALUE_TYPE_CATALOG` is
 * a total `Record<CustomFieldValueTypeName, ...>`, so the compiler refuses a
 * missing catalog entry -- but this is a plain `readonly
 * CustomFieldValueTypeName[]`, so a type added to the union and the catalog and
 * forgotten HERE compiles clean, and every gate in the module that iterates
 * `ALL_VALUE_TYPES` (the render-completeness gate, the format-completeness
 * gate, the locale-description parity gate) would then pass by never looking at
 * the new type at all. `valueTypeRegistry.test.ts` closes that with two
 * assertions that compare this array against the catalog's own keys and against
 * the backend enum's ordinals; do not weaken either into something derived from
 * this array alone.
 */
export const ALL_VALUE_TYPES: readonly CustomFieldValueTypeName[] = [
  "Text",
  "Number",
  "Boolean",
  "Date",
  "Select",
  "LongText",
  "DateTime",
  "MultiSelect",
  "Email",
  "Url",
  "Phone",
  "Percent",
  "Rating",
  "Currency",
  "Duration",
  "Time",
  "Color",
  "EntityReference",
  "UserReference",
  "File",
  "Image",
  "RichText",
];
