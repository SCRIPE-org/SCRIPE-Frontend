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
 * Placed flat in presentation/ (no dedicated `registry/` subfolder) to match
 * this codebase's actual convention for a Record<EnumValue, Metadata> lookup
 * table living alongside its module's other presentation code -- see
 * subscriptions' `presentation/constants.ts` (STATUS_VARIANTS/TYPE_VARIANTS,
 * the closest structural precedent), signin's `presentation/components/layouts/index.ts`
 * (LAYOUT_REGISTRY), and settings' `settings-nav.tsx` (GROUP_PANELS) -- none of
 * which nest their registry constant inside its own `registry/` folder; no
 * `presentation/registry/` or `domain/registry/` directory exists anywhere in
 * this codebase today.
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
export type { CustomFieldValueTypeName } from "../../../custom-field-value/src/data/models/CustomFieldValueModel";

import type { CustomFieldValueTypeName } from "../../../custom-field-value/src/data/models/CustomFieldValueModel";

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
 * All 13 known type names, in the same fixed display order used everywhere
 * else in this module (CustomFieldListView.tsx's valueTypeOptions,
 * InlineAddCustomFieldDialog.tsx) -- and matching
 * CustomFieldValueType's own backend declaration order (Text=0 .. Rating=12),
 * so the type picker's option order reads the same as the enum's shipped
 * history rather than an arbitrary regrouping. Wave 3.2 Batch 3 appends
 * Email/Url/Phone/Percent/Rating (8-12), the exact order the backend's own
 * enum and Batch 1/2 reports assign them.
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
];
