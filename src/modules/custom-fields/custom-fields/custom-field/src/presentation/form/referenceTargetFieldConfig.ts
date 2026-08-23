/**
 * Shared Entity Reference target-type FieldConfig used by all custom-field authors.
 *
 * Keeping this outside a screen component lets the standalone definitions page and
 * every inline host-form drawer expose the same modern selector, loading state,
 * empty-state explanation, and unpinned behaviour.
 */
import { resolveIntlLocale } from "@core/common/utils";
import type { FieldConfig, FieldOption } from "@core/ui/forms/generic-form";
import type { CustomFieldValueTypeName } from "../registries/valueTypeRegistry";
import type { EntityLookupType } from "../../../../entity-lookup/src/data/models/EntityLookupModel";
export interface RegistryNamedType {
  key: string;
  owningModule: string;
  displayNameEn: string;
  displayNameAr: string;
}

/**
 * Returns `value` when it is genuinely a usable string, `undefined` otherwise.
 *
 * Deliberately the same shape as `getValueTypeCatalogEntry` (valueTypeRegistry.ts): it takes
 * `unknown` rather than the `string` the compiler believes in -- the whole point is defending
 * against a value that ISN'T one, which a `string` parameter would let the caller assume away -- and
 * it answers with `undefined` on a miss instead of throwing, so the caller's fallback is forced by
 * the return type rather than left to be remembered. That is the discipline `mapValueToFieldConfig`
 * (customFieldsCrudIntegration.tsx) already applies at its own wire boundary, for the same reason.
 *
 * Whitespace-only counts as a miss: `"   "` is as unreadable in a dropdown as an absent name, and
 * unlike an absent one it would sort ahead of every real name in its group.
 */
export function readWireString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.trim() === "" ? undefined : value;
}

/**
 * The display name to show for one registry type, or `undefined` when the wire supplied neither.
 *
 * Falls back to the OTHER language before giving up -- the same "Arabic wins only when one was
 * actually set, otherwise English" rule `mapValueToFieldConfig` applies to a custom field's own
 * bilingual label pair. A type registered with an English name only is far better shown under that
 * name than under its key. For a fully-populated pair this is byte-identical to the plain
 * `language === "ar" ? ar : en` it replaces, so nothing about well-formed data moves.
 *
 * Not `resolveBilingualLabel` (@core/common/utils): that returns `string` unconditionally and has no
 * concept of a miss, which is exactly the assumption being guarded against here.
 */
export function resolveRegistryTypeName(
  type: RegistryNamedType,
  language: string
): string | undefined {
  const active = language === "ar" ? type?.displayNameAr : type?.displayNameEn;
  const other = language === "ar" ? type?.displayNameEn : type?.displayNameAr;
  return readWireString(active) ?? readWireString(other);
}

/**
 * One option label for a registry type: `Name (key)`, or the bare key when no name arrived.
 *
 * WHY THE KEY, AND NOT BLANK, AND NOT A TRANSLATED "(unnamed)". The backend's own lookup providers
 * face this exact question one layer down and answer it the same way: `EntityLookupItem.displayName`
 * is documented as "Never blank -- a provider that cannot build one falls back to the id"
 * (EntityLookupModel.ts). The reasoning carries over intact. A row with no text cannot be typed for
 * in a searchable picker, cannot be named in a bug report, and cannot be told apart from a second
 * nameless row, so it is unselectable in practice even though it is present. The key is the one
 * string guaranteed to be meaningful here: it is the value being submitted, it is already shown
 * beside every other name in this same list, and it carries the owning module in its own prefix
 * (`hrms.staff-member`) -- so a keyed row degrades to "technical but actionable" instead of
 * "invisible". A translated placeholder would need a new locale string and would still leave two
 * unnamed types indistinguishable.
 *
 * The parenthesised key is dropped in that case rather than doubled: `hrms.staff-member
 * (hrms.staff-member)` reads as a rendering bug, which is the one thing this row is not.
 *
 * `""` is returned only when the type has neither a name nor a key. Both call sites drop such rows
 * before labelling them (an option whose value is unusable must not be offered at all), so this is
 * the total-function tail rather than a state the product renders.
 */
export function formatRegistryTypeOptionLabel(type: RegistryNamedType, language: string): string {
  const name = resolveRegistryTypeName(type, language);
  const key = readWireString(type?.key);
  if (name === undefined) return key ?? "";
  return key === undefined ? name : `${name} (${key})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Definition-level reference target pin (Wave 4 follow-up)
//
// `CustomField.ReferenceTargetEntityTypeKey` says which ONE entity type a reference field's values
// may point at. The backend has accepted it on both `CreateCustomFieldRequest` and
// `UpdateCustomFieldRequest` (MaxLength 100 on each) since the column landed; nothing in the product
// set it, so every EntityReference definition could only be created UNPINNED.
//
// Exported rather than left inline so its own tests can run the REAL config object and the REAL
// predicate instead of regex-matching this file's source for an expression that may or may not mean
// anything at runtime. That regex style is exactly how the Wave 2.5 C-1 data-loss defect shipped with
// a fully green suite -- see `customFieldEditInitialValues.ts`, extracted for the same reason.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The form-state key, and therefore the WIRE property name.
 *
 * `GenericForm.submitData` is a raw spread of form state, so this string is what lands on
 * `CreateCustomFieldRequest.ReferenceTargetEntityTypeKey` /
 * `UpdateCustomFieldRequest.ReferenceTargetEntityTypeKey` under the API's camelCase policy. It must
 * match those property names exactly; a typo here is a silently ignored pin, not a compile error.
 */
export const REFERENCE_TARGET_FIELD_NAME = "referenceTargetEntityTypeKey";

/**
 * What "unpinned" is written as in form state.
 *
 * `""`, not `null` or an absent key, and each of the three would behave differently:
 *
 *  - `""` reaches the server and is read as unpinned. Both arms of the backend gate accept it:
 *    `ReferenceTargetOwnership.NormalizeTargetEntityType` short-circuits on
 *    `string.IsNullOrWhiteSpace` for a value type that targets nothing, and
 *    `EntityReferenceValueTypeHandler.NormalizeTargetEntityTypeKey` returns `Result.Success(null)` for
 *    a blank submission on one that does. So a Text or Boolean definition submitting `""` is NOT
 *    refused for carrying a meaningless target -- which is what makes it safe to keep this key in form
 *    state for every value type rather than trying to strip it for most of them.
 *  - An ABSENT key would be read identically by the server, but the key cannot be absent on the edit
 *    form anyway: the update command full-replaces the column, so an edit that omitted it would unpin
 *    the field. Keeping one representation for both forms removes that as a thing to remember.
 *  - `null` would work too, but `""` is what a `<select>` sentinel option can actually hold, and this
 *    module already uses `""` as the sentinel for the field-group picker for the same reason.
 *
 * Note this is the opposite decision from `validatorKind`, which needs a write-seam coercion to
 * `null`: that one is a nullable C# ENUM and cannot model-bind `""` at all. This column is a plain
 * `string?`, so `""` binds and is then normalized server-side.
 */
export const UNPINNED_REFERENCE_TARGET = "";

/**
 * The value type whose definitions may be pinned FROM THIS FORM.
 *
 * A literal, not a `VALUE_TYPE_CATALOG` lookup -- the same call the `validatorKind` guard below makes
 * and for the same reason: "may carry a definition-level target pin" is not a property every value
 * type has an opinion about, and the authoritative answer lives on the backend handler capability
 * (`IEntityTargetedValueTypeHandler`), which this catalog deliberately does not mirror. Mirroring it
 * here would create a second source of truth that goes stale silently the day a third targeted type
 * ships.
 */
const PINNABLE_VALUE_TYPE: CustomFieldValueTypeName = "EntityReference";

/**
 * Whether the target-type picker is shown for the definition currently in the form.
 *
 * EntityReference only. UserReference is deliberately EXCLUDED even though the backend would accept a
 * pin on it: its target allowlist is exactly one key (`identity.user`, with `identity.admin`,
 * `identity.theme` and `identity.user-group` each excluded for a recorded reason), and
 * `UserReferenceValueTypeHandler.ImplicitTargetEntityTypeKey` already resolves that single target for
 * an UNPINNED field. So there is nothing to choose: a picker offering one option would imply a
 * decision the admin does not actually get to make, and a picker offering a way to "clear" it would
 * imply the target could be something else.
 *
 * Hidden also means hidden for every non-reference type, and hidden for an unset `valueType` (the
 * create form's state before the admin has picked one) -- `undefined === "EntityReference"` is false,
 * so this degrades closed with no fallback needed, unlike the catalog-lookup guards which need an
 * explicit `??`.
 *
 * Hiding the field does NOT drop the key from the payload: `isVisible` gates rendering and
 * required-validation only, and `GenericForm` submits a raw spread of form state. That is the
 * behaviour this relies on -- a UserReference definition pinned through the API keeps its pin through
 * an edit made on this form, because the seeded value travels even though the control never draws.
 */
export function isReferenceTargetPickerVisible(form: Record<string, unknown>): boolean {
  return form.valueType === PINNABLE_VALUE_TYPE;
}

/** Inputs for {@link buildReferenceTargetField}. */
export interface BuildReferenceTargetFieldArgs {
  /** i18n lookup; the same `t` the surrounding view uses. */
  t: (key: string) => string;
  /** Active UI language, deciding which of the server's two display names is shown. */
  language: string;
  /** The types this caller may reference, from `useEntityLookupAvailableTypes`. */
  types: readonly EntityLookupType[];
  /** Available-types query in flight -- renders the select's own loading state. */
  isLoading: boolean;
  /** The query FAILED (network, 500). Not the same as it answering with an empty list. */
  isError: boolean;
  /** The query SUCCEEDED and the answer was empty: "you may not reference anything". */
  isEmpty: boolean;
  /**
   * True for the EDIT form. Adds the re-point consequence to the helper text, which is only a
   * question that can arise for a definition that already exists and may already hold values.
   */
  isExistingDefinition: boolean;
}

/**
 * Sort order for the target-type option list: owning module, then the displayed name, then the key.
 *
 * TOTAL BY CONSTRUCTION. Every operand goes through `readWireString` and defaults to `""`, because
 * `localeCompare` on an absent property is a `TypeError` and this comparator runs inside a
 * render-phase `useMemo` -- one entity type registered without the active language's name used to
 * throw from here and take the whole definitions screen down, rather than costing the list one row.
 * For a well-formed list every operand is the same string it always was, so the resulting order is
 * unchanged; `CustomFieldListView.referenceTargetPicker.test.tsx` pins the full order in both
 * languages so the guard cannot quietly reshuffle what it is protecting.
 *
 * The middle key is the name the row ACTUALLY SHOWS, which for a nameless row is its key (see
 * `formatRegistryTypeOptionLabel`). Filing such a row under `""` instead would put it ahead of every
 * named row in its module for a reason nothing on screen explains.
 *
 * Only the name comparison is locale-aware, exactly as before: `owningModule` and `key` are ASCII
 * registry identifiers rather than display text, and collating them under `ar-EG` would order the
 * grouping by rules that have nothing to do with anything visible.
 */
function compareReferenceTargetOptions(
  a: RegistryNamedType,
  b: RegistryNamedType,
  language: string
): number {
  const moduleOf = (type: RegistryNamedType) => readWireString(type?.owningModule) ?? "";
  const keyOf = (type: RegistryNamedType) => readWireString(type?.key) ?? "";
  const shownNameOf = (type: RegistryNamedType) =>
    resolveRegistryTypeName(type, language) ?? keyOf(type);

  return (
    moduleOf(a).localeCompare(moduleOf(b)) ||
    shownNameOf(a).localeCompare(shownNameOf(b), resolveIntlLocale(language)) ||
    keyOf(a).localeCompare(keyOf(b))
  );
}

/**
 * Builds the target-entity-type picker's `FieldConfig`.
 *
 * OPTION ORDER AND LABELS. Sorted by `owningModule`, then by the displayed name, then by key (see
 * `compareReferenceTargetOptions`) -- the same "grouping by sort order rather than by a visual
 * divider" this file already applies to the entity-type picker above, because `GenericSelect` has no
 * optgroup primitive here. The label is `Name (key)`, matching that picker exactly; no separate
 * `— Module` suffix is appended because the key shown beside the name already opens with the owning
 * module's own namespace (`identity.user` is registered by `Identity`, `hrms.staff-member` by
 * `Hrms`), so a suffix would restate what is two characters to its left. The names themselves come
 * from the backend entity-type registry and are NOT translation keys -- they must be read off
 * `displayNameEn`/`displayNameAr` and never looked up in this module's locale files.
 *
 * NONE OF THOSE FOUR PROPERTIES IS GUARANTEED TO ARRIVE, whatever the wire types say -- see the
 * registry-name helpers at the top of this file for the exposure and for what a row missing its name
 * renders as instead of blank. A row missing its KEY is dropped outright; the reason is at the filter.
 *
 * THE SENTINEL IS ALWAYS PRESENT, in every state including the empty and failed ones. It is not a
 * "no selection" placeholder: unpinned is a legal, permanent configuration, and selecting the
 * sentinel is the ONLY way to clear an existing pin. Dropping it when the list is empty would make an
 * accidentally-pinned field uncorrectable by anyone who cannot see that type.
 *
 * THE CONTROL IS NEVER DISABLED, for the same reason. A disabled select on an empty or failed list
 * would take away the one action that still makes sense there (unpin), and would look identical to a
 * permissions problem.
 *
 * @returns A `select` FieldConfig, spread verbatim into the create and edit field arrays.
 */
export function buildReferenceTargetField({
  t,
  language,
  types,
  isLoading,
  isError,
  isEmpty,
  isExistingDefinition,
}: BuildReferenceTargetFieldArgs): FieldConfig {
  // "An array" is a wire claim like any other. `useEntityLookupAvailableTypes` defaults an ABSENT
  // body to `[]`, which covers a 204 but not a malformed 200 -- and a non-iterable reaching the
  // spread below throws from the same render-phase memo as everything else here.
  const availableTypes: readonly EntityLookupType[] = Array.isArray(types) ? types : [];

  const options: FieldOption[] = [
    { value: UNPINNED_REFERENCE_TARGET, label: t("customField.referenceTarget.unpinned") },
    ...availableTypes
      // DROPPED, not degraded -- the one place in this builder where absent beats present. `value`
      // IS the key: without one the option submits `undefined`, and the only string available to
      // substitute is `""`, which is already spoken for as the UNPIN sentinel. A keyless row given
      // that value would silently clear the pin when clicked, which is worse than a row that is
      // simply not offered.
      .filter((type) => readWireString(type?.key) !== undefined)
      // `.filter` above already returns a fresh array, which is what keeps the `.sort` below off the
      // react-query cache `types` points at -- sorting in place would reorder the list for every
      // other consumer. It stands in for the explicit `[...types]` copy this used to make, so do not
      // remove it without restoring one.
      .sort((a, b) => compareReferenceTargetOptions(a, b, language))
      .map((type) => ({ value: type.key, label: formatRegistryTypeOptionLabel(type, language) })),
  ];

  // Precedence matters and is not arbitrary. A FAILURE must not be described as "there is nothing you
  // can reference" (that would send an admin to ask for permissions they already have), and an EMPTY
  // list must not be described as a failure (it is a 200 and a correct authorization outcome). Only
  // once neither holds is there a pin to explain, and only on an existing definition is re-pointing a
  // thing that can happen.
  const description = isError
    ? t("customField.referenceTarget.loadFailed")
    : isEmpty
      ? t("customField.referenceTarget.noneAvailable")
      : isExistingDefinition
        ? `${t("customField.referenceTarget.description")} ${t("customField.referenceTarget.repointWarning")}`
        : t("customField.referenceTarget.description");

  return {
    name: REFERENCE_TARGET_FIELD_NAME,
    label: t("customField.fields.referenceTargetEntityTypeKey"),
    // Load-bearing for accessibility, exactly as `fieldGroupFieldConfig.ts` records for its own
    // picker: GenericForm's `select` branch is the one that passes `aria-label` down to GenericSelect,
    // and that aria-label is the control's only accessible name because the trigger is a
    // `role="combobox"` div that no `<label for>` can attach to.
    type: "select",
    options,
    loading: isLoading,
    description,
    isVisible: isReferenceTargetPickerVisible,
  };
}
