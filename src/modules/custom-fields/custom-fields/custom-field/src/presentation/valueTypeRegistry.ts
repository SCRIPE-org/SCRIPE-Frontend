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
 * All 5 known type names, in the same fixed display order used everywhere
 * else in this module (CustomFieldListView.tsx's valueTypeOptions,
 * InlineAddCustomFieldDialog.tsx).
 */
export const ALL_VALUE_TYPES: readonly CustomFieldValueTypeName[] = [
  "Text",
  "Number",
  "Boolean",
  "Date",
  "Select",
];
