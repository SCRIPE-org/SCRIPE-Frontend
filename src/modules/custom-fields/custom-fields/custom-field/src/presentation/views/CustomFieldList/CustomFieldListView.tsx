/**
 * CustomField List View
 *
 * Pure UI component for displaying the CustomField definition list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useCustomFieldViewModel } from "../../viewmodels/useCustomFieldViewModel";
import type { CustomField } from "../../../domain/entities/CustomField";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { ErrorMessage } from "@core/ui/error-message";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { resolveIntlLocale } from "@core/common/utils";
import { BarChart3, Boxes, FolderTree, Globe2, History, ListTree, Pencil, Trash2 } from "lucide-react";
import {
  VALUE_TYPE_CATALOG,
  ALL_VALUE_TYPES,
  type CustomFieldValueTypeName,
} from "../../registries/valueTypeRegistry";
import { VALIDATOR_KIND_CATALOG, ALL_VALIDATOR_KINDS } from "../../registries/validatorKindRegistry";
import { buildCustomFieldEditInitialValues } from "../../form/customFieldEditInitialValues";
import { useFieldGroupOptions } from "../../../../../field-group/src/presentation/viewmodels/useFieldGroupOptions";
import { buildFieldGroupField, makeFieldGroupPickerVisibility } from "../../form/fieldGroupFieldConfig";
// Wave 4 follow-up. The definition-level reference target pin's option list. Deep import, matching
// this module's own convention for reaching into the entity-lookup submodule (see
// EntityReferenceCustomFieldControl.tsx) rather than through that submodule's index.
import { useEntityLookupAvailableTypes } from "../../../../../entity-lookup/src/presentation/hooks/useEntityLookupAvailableTypes";
import type { EntityLookupType } from "../../../../../entity-lookup/src/data/models/EntityLookupModel";
import type { FieldConfig, FieldOption } from "@core/ui/forms/generic-form";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../../permission-constants";
import { usePermission } from "@core/hooks/use-permission";
import { FieldHistoryDialog } from "../../dialogs/FieldHistoryDialog";
import { FieldImpactDialog } from "../../dialogs/FieldImpactDialog";
import { useFieldInsightViewModel } from "../../viewmodels/useFieldInsightViewModel";
// Wave 6 row 6.5. Self-contained: it owns its own permission gate, its own open
// state and its own locale chunk, so it adds nothing to the config memo below.
import { SchemaExportButton } from "../../../../../schema/src/presentation/components/SchemaExportButton";
// Wave 6 row 6.4. Same shape as the schema button beside it, and self-contained
// for the same reasons. This is the endpoint's FIRST frontend caller: the export
// route has been complete server-side for a while with no way to reach it from
// the product, and the operator guide told testers to click an Export action in
// this header that did not exist.
import { DefinitionExportButton } from "../../../../../definition-export/src/presentation/components/DefinitionExportButton";

// Single source of truth for per-value-type presentation metadata (badge
// tone, placeholder/options applicability, display label) -- see
// valueTypeRegistry.ts. Previously this file (and InlineAddCustomFieldDialog.tsx,
// independently) hardcoded SELECT_VALUE_TYPE/NO_PLACEHOLDER_VALUE_TYPES/
// VALUE_TYPE_VARIANTS/valueTypeOptions/valueTypeLabels separately, and the
// edit form's `options` field visibility guard was missing entirely in one
// of the two copies -- see CustomFieldListView.optionsVisibility.test.tsx.

// ─────────────────────────────────────────────────────────────────────────────
// Registry-sourced entity type names -- wire data, compiler-unchecked
//
// TWO of this view's option lists are built from the backend ENTITY-TYPE REGISTRY: the definition's
// own entity type (`EntityTypeItemJson`, via `useCustomFieldViewModel`) and the reference target
// pin's candidate list (`EntityLookupType`, via `useEntityLookupAvailableTypes`). Both wire shapes
// declare `key`/`owningModule`/`displayNameEn`/`displayNameAr` as non-optional `string`, and NOTHING
// enforces that at runtime -- neither has a mapper or a runtime guard, and `EntityLookupModel.ts`'s
// own header records the consequence in as many words: "the runtime hands back `undefined` and a
// picker row renders blank". The names come from each module's own `registry.Register(...)` call, so
// one module shipping a type without an Arabic name is the entire trigger.
//
// A BLANK ROW WAS THE OPTIMISTIC READING. `String.prototype.localeCompare` on an absent name is a
// `TypeError`, and the target-type sort that called it runs inside a render-phase `useMemo`, so one
// half-registered entity type took the whole definitions screen down in Arabic rather than costing
// the list one row. These helpers exist so neither list can dereference an unchecked wire string
// again, and are exported so their behaviour can be tested against the real functions instead of
// regex-matched out of this file -- the same reason `buildReferenceTargetField` below is exported.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The `key`/`owningModule`/`displayNameEn`/`displayNameAr` quartet both registry-sourced wire shapes
 * carry.
 *
 * Structural rather than a union of the two interfaces: `EntityLookupType` lives in the
 * entity-lookup submodule and `EntityTypeItemJson` in this one, they were declared independently,
 * and the helpers below need nothing either declares beyond these four properties. Both are
 * assignable to it with no cast.
 */
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

export const CustomFieldListView = React.memo(function CustomFieldListView() {
  useModuleLocales(() => import("../../../../locales"), "customFields");
  const { t, language } = useI18n();
  const { vm, entityTypes, isEntityTypesError, refetchEntityTypes } = useCustomFieldViewModel();
  const { isSuperAdmin } = usePermissions();
  const { isInTenantWorld } = useTenantContext();
  // A Super Admin who hasn't drilled into a tenant is in genuine platform
  // context: every definition created from here is GLOBAL (TenantId = null,
  // inherited by every tenant), not scoped to "their own" tenant the way the
  // exact same form behaves for anyone else. The form gives no other hint of
  // this, so it's surfaced here, before "Add" is even clicked.
  const isPlatformContext = isSuperAdmin && !isInTenantWorld;

  // ── Field-group picker (Wave 5 row 5.2) ─────────────────────────────
  //
  // Which groups are offered depends on the definition's entity type, but
  // `FieldConfig.options` is a STATIC array, evaluated when the config object
  // is built -- only `isVisible` ever receives live form state. So the entity
  // type currently in play is tracked here instead:
  //
  //   - editing: `editingItem` is a DETAIL fetch (see openEditModal) and
  //     already carries `entityTypeKey`, which is immutable, so it cannot
  //     change mid-edit;
  //   - creating: whatever the entityTypeKey select holds right now, pushed up
  //     by that field's own onChange below.
  const [createEntityTypeKey, setCreateEntityTypeKey] = useState("");
  const activeEntityTypeKey =
    vm.isEditModalOpen && vm.editingItem ? vm.editingItem.entityTypeKey : createEntityTypeKey;
  /**
   * `custom-field-groups.view` is a NEW permission (row 5.2), so no role that
   * predates it holds it -- including roles carrying the full `custom-fields.*`
   * set. Without this gate such an admin got a 403 from
   * `GET /field-groups` on every create/edit modal open, plus the
   * `fieldGroupLoadFailed` copy under a picker that could only ever offer "no
   * group". It also gates the "Manage field groups" link below, which would
   * otherwise lead to a page `PAGE_PERMISSIONS` refuses.
   */
  const canViewFieldGroups = usePermission(CUSTOM_FIELDS_PERMISSIONS.FIELD_GROUP_VIEW);
  const canViewHistory = usePermission(CUSTOM_FIELDS_PERMISSIONS.VIEW_HISTORY);
  const canViewUsage = usePermission(CUSTOM_FIELDS_PERMISSIONS.VIEW_USAGE);
  const insight = useFieldInsightViewModel();
  // Destructured so the config memo below can depend on the STABLE callbacks. Depending on
  // `insight` itself would satisfy the linter and defeat the memo: the hook returns a fresh
  // object literal every render even though each callback inside it is memoized.
  const { openUsage, openHistory, requestDelete } = insight;
  const {
    options: fieldGroupOptions,
    isLoading: isFieldGroupsLoading,
    isError: isFieldGroupsError,
  } = useFieldGroupOptions(activeEntityTypeKey, { enabled: canViewFieldGroups });

  /** Handle to the pending deferral below, so unmount can cancel it. */
  const entityTypeDeferRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (entityTypeDeferRef.current !== null) clearTimeout(entityTypeDeferRef.current);
    },
    []
  );

  /**
   * Deferred with setTimeout(0) on purpose: `FieldConfig.onChange` is invoked
   * from INSIDE GenericForm's `setFormData` updater, and calling another
   * component's setState from there is React's "cannot update a component
   * while rendering a different component" violation. TenantDialogs.tsx
   * already defers the same way at its own equivalent seam.
   *
   * The returned object is merged into form state synchronously by
   * GenericForm, clearing any group chosen for the PREVIOUS entity type -- a
   * group id from one entity type is never valid for another, and the backend
   * rejects the mismatch outright.
   */
  const handleEntityTypeChange = useCallback((value: unknown) => {
    const key = typeof value === "string" ? value : "";
    // Tracked and cleared on unmount: a modal closed within the same tick as
    // an entity-type change would otherwise leave a timer that fires setState
    // on an unmounted component.
    if (entityTypeDeferRef.current !== null) clearTimeout(entityTypeDeferRef.current);
    entityTypeDeferRef.current = setTimeout(() => setCreateEntityTypeKey(key), 0);
    return { fieldGroupId: "" };
  }, []);

  const entityTypeOptions = useMemo(() => {
    // `Array.isArray`, not the old `!entityTypes || entityTypes.length === 0`: that guard let a
    // malformed 200 body through (`{}.length` is `undefined`, which is not `0`) to the `.filter`
    // below, and a TypeError raised from this memo takes the screen, not the dropdown.
    const available: typeof entityTypes = Array.isArray(entityTypes) ? entityTypes : [];
    // Same reason the reference-target picker drops keyless rows: `value` IS the key, and an option
    // that submits `undefined` for a REQUIRED field is worse than one that is not offered.
    const usable = available.filter((item) => readWireString(item?.key) !== undefined);
    if (usable.length === 0) return [];
    // Screen-backed entities first, API-only ones after -- native <select>/
    // GenericSelect has no optgroup primitive here, so the grouping is done
    // by sort order plus a label suffix rather than a visual divider. `?? true`
    // matches an older backend response that omits the field (treat as
    // screen-backed, the pre-this-feature default) rather than mislabeling
    // every entity type as API-only.
    const onScreen = usable.filter((item) => item.hasFrontendScreen ?? true);
    const apiOnly = usable.filter((item) => !(item.hasFrontendScreen ?? true));
    const toOption = (item: (typeof entityTypes)[number], suffix?: string) => ({
      value: item.key,
      // Guarded, and key-labelled on a miss, exactly as the target-type picker above is: this list
      // is read from the SAME backend registry through the same unchecked wire contract, and the
      // inlined ternary this replaces rendered a type missing the active language's name as the
      // literal text "undefined (hrms.staff-member)".
      label: `${formatRegistryTypeOptionLabel(item, language)}${suffix ?? ""}`,
    });
    return [
      ...onScreen.map((item) => toOption(item)),
      ...apiOnly.map((item) => toOption(item, ` — ${t("customField.entityTypeGroups.apiOnly")}`)),
    ];
  }, [entityTypes, language, t]);

  const noFrontendScreenDescription = useMemo(() => {
    // Array-guarded for the same reason `entityTypeOptions` above is; `?? []` alone covered only an
    // absent body.
    const available: typeof entityTypes = Array.isArray(entityTypes) ? entityTypes : [];
    const apiOnlyEntities = available.filter((item) => !(item?.hasFrontendScreen ?? true));
    // Static, always-visible note rather than a live per-selection popup --
    // GenericForm has no "computed text tied to another field's current
    // value" primitive today. Combined with the label suffix above (which
    // IS per-option), this still tells an admin, before they pick anything,
    // that some entries in the list won't render on any screen yet.
    const names = apiOnlyEntities
      // Name, else key -- the same fallback the option labels use, so this sentence names the same
      // rows the dropdown does. The inlined ternary it replaces listed the word "undefined" for a
      // type registered without the active language's name.
      .map((item) => resolveRegistryTypeName(item, language) ?? readWireString(item?.key))
      .filter((name): name is string => name !== undefined);
    // Nothing nameable to warn about reads as no warning at all, rather than as a sentence with a
    // hole where the entity names belong.
    if (names.length === 0) return undefined;
    return t("customField.noFrontendScreenWarning", { entity: names.join(", ") });
  }, [entityTypes, language, t]);

  const valueTypeOptions = useMemo(
    () =>
      ALL_VALUE_TYPES.map((type) => ({ value: type, label: t(VALUE_TYPE_CATALOG[type].labelKey) })),
    [t]
  );

  // Wave 2 Step 2.5 Task 10 (D5: admin-definition-form only). The picker is
  // fully optional -- a leading sentinel option lets an admin explicitly
  // pick "no validator" (or clear a previously-attached one on Edit), same
  // as picking any real kind. Selecting it writes "" into form state; the
  // write-seam normalization in useCustomFieldViewModel.ts (TRAP 1) turns
  // that into `null` before it ever reaches the API, since a nullable enum
  // can't deserialize "".
  const validatorKindOptions = useMemo(
    () => [
      { value: "", label: t("customField.validatorKindNone") },
      ...ALL_VALIDATOR_KINDS.map((kind) => ({
        value: kind,
        label: t(VALIDATOR_KIND_CATALOG[kind].labelKey),
      })),
    ],
    [t]
  );

  // One FieldConfig per parameterized ValidatorKind (6 of the 13), built
  // from the catalog rather than hand-enumerated -- each entry is visible
  // only when its own kind is the one currently selected, so exactly one (or
  // none) of these ever renders/submits for a given form state, and adding a
  // 14th member later needs no new field here. PostalCode alone renders as a
  // closed-set picker (its catalog entry's supportedParamValues) instead of
  // free text, so its 7-country allowlist is read from validatorKindRegistry.ts
  // rather than re-typed here. Note what that does and does not buy (corrected
  // in the Step 2.5 fix round, finding I-1): it removes a SECOND frontend copy
  // of the list, but the catalog's own copy is still a hand transcription of
  // the backend's ValidatorPresets.SupportedPostalCodeCountries -- see that
  // catalog entry's doc comment, and validatorKindRegistry.backendContract.test.ts,
  // which is the only thing that actually compares the two.
  // An AE selection isn't offered (Task 8's catalog
  // already excludes it, R9) -- if a stale/legacy value still names it, the
  // backend's own dedicated AE-rejection message surfaces through
  // GenericForm's existing serverError handling rather than being swallowed
  // here.
  const validatorParamFields = useMemo(
    () =>
      ALL_VALIDATOR_KINDS.filter((kind) => VALIDATOR_KIND_CATALOG[kind].hasParam).map((kind) => {
        const entry = VALIDATOR_KIND_CATALOG[kind];
        const isClosedSet = entry.supportedParamValues !== undefined;
        return {
          name: "validatorParam",
          label: t("customField.fields.validatorParam"),
          type: (isClosedSet ? "select" : "text") as "select" | "text",
          placeholder: isClosedSet ? undefined : t(entry.paramHintKey as string),
          description: t(entry.paramHintKey as string),
          options: isClosedSet
            ? entry.supportedParamValues!.map((code) => ({ value: code, label: code }))
            : undefined,
          isVisible: (form: Record<string, unknown>) =>
            form.valueType === "Text" && form.validatorKind === kind,
        };
      }),
    [t]
  );

  /**
   * The field-group picker, shared verbatim by the create and edit forms
   * (Wave 5 row 5.2). Built by `fieldGroupFieldConfig.ts` rather than inline
   * here, so a test can render the REAL config through the REAL GenericForm --
   * see that module's own header for why `type: "select"` is load-bearing for
   * the control's accessible name.
   *
   * While the groups query is still in flight the option list holds only the
   * "no group" sentinel, so an already-assigned group renders momentarily
   * blank. That is display only: GenericForm seeds `formData` from
   * `editInitialValues`, not from the option list, and submits a raw spread of
   * that state -- so the stored `fieldGroupId` is still what gets sent if the
   * admin saves during that window.
   */
  /**
   * Wave 6 ruling R10 — the classification pair, declared once and spread into BOTH forms.
   *
   * Duplicating them would be the same shape as the Wave 2.5 C-1 defect this file already carries a
   * comment about: the update command replaces every property, so a field present on create and
   * missing on edit silently resets to its default on every unrelated save. `isExportable` defaults
   * to TRUE server-side, so the reset direction here would silently RE-ENABLE export on a field an
   * admin had deliberately excluded.
   */
  const classificationFields = useMemo(
    () => [
      {
        name: "sensitivity",
        label: t("customField.fields.sensitivity"),
        type: "select" as const,
        // Wire values are the C# enum member names, not display strings — see the backend's
        // FieldSensitivity. Sending a translated label would fail enum binding.
        options: [
          { value: "None", label: t("customField.sensitivity.none") },
          { value: "Internal", label: t("customField.sensitivity.internal") },
          { value: "Confidential", label: t("customField.sensitivity.confidential") },
          { value: "Restricted", label: t("customField.sensitivity.restricted") },
        ],
        description: t("customField.hints.sensitivity"),
      },
      {
        name: "isExportable",
        label: t("customField.fields.isExportable"),
        type: "switch" as const,
        description: t("customField.hints.isExportable"),
      },
    ],
    // Memoized for the same reason fieldGroupField below is: it is consumed inside the config
    // useMemo, and a fresh array identity on every render would make that memo recompute every
    // render -- which is what the exhaustive-deps warning is actually about.
    [t]
  );

  // ── Reference target pin (Wave 4 follow-up) ─────────────────────────
  //
  // Fetched unconditionally on this screen rather than gated on the live `valueType`, for two
  // reasons. FieldConfig.options is a STATIC array evaluated when the config is built and only
  // `isVisible` sees live form state (the same constraint the field-group picker above works
  // around), so waiting until EntityReference is selected would mean the picker's first render has
  // no options in it. And unlike `GET /field-groups`, this list needs no permission gate to be safe
  // to ask for: `GET /entity-lookup/types` carries only the controller's `[Authorize]`/`[AdminOnly]`
  // -- no `[PermissionRequired]`, no documented 403 -- and answers a caller who may reference
  // nothing with a 200 and an empty array. So there is no role for which fetching it produces the
  // repeating 403 that `canViewFieldGroups` exists to prevent. It is cached for an hour, so this
  // costs one request per session, not one per modal open.
  const {
    types: referenceTargetTypes,
    isLoading: isReferenceTargetTypesLoading,
    isError: isReferenceTargetTypesError,
    isEmpty: isReferenceTargetTypesEmpty,
  } = useEntityLookupAvailableTypes();

  /**
   * The picker, in its two forms.
   *
   * Built as ONE memoized pair rather than two independent memos so the create and edit copies can
   * never be given different option lists -- the only thing that may legitimately differ between
   * them is the helper text, and that difference is a single argument. Same reasoning as
   * `classificationFields` above: memoized because it is consumed inside the config `useMemo`, and a
   * fresh object identity every render would make that memo recompute every render.
   */
  const referenceTargetFields = useMemo(() => {
    const shared = {
      t,
      language,
      types: referenceTargetTypes,
      isLoading: isReferenceTargetTypesLoading,
      isError: isReferenceTargetTypesError,
      isEmpty: isReferenceTargetTypesEmpty,
    };
    return {
      create: buildReferenceTargetField({ ...shared, isExistingDefinition: false }),
      edit: buildReferenceTargetField({ ...shared, isExistingDefinition: true }),
    };
  }, [
    t,
    language,
    referenceTargetTypes,
    isReferenceTargetTypesLoading,
    isReferenceTargetTypesError,
    isReferenceTargetTypesEmpty,
  ]);

  const fieldGroupField = useMemo(
    () => ({
      ...buildFieldGroupField({
        t,
        options: fieldGroupOptions,
        isLoading: isFieldGroupsLoading,
        isError: isFieldGroupsError,
      }),
      // The EDIT form's guard: permission only, no entity-type condition
      // (entityTypeKey is immutable and already known there). The create form
      // spreads this and overrides `isVisible` with the two-condition variant.
      isVisible: makeFieldGroupPickerVisibility({
        canView: canViewFieldGroups,
        requireEntityType: false,
      }),
    }),
    [t, fieldGroupOptions, isFieldGroupsLoading, isFieldGroupsError, canViewFieldGroups]
  );

  // Same fallback shape as the old `valueTypeLabels[value] ?? value` map:
  // an unrecognized/unknown wire value falls back to the raw value itself
  // rather than throwing or rendering blank.
  const valueTypeLabelOf = useMemo(
    () => (value: string) => {
      const entry = VALUE_TYPE_CATALOG[value as CustomFieldValueTypeName];
      return entry ? t(entry.labelKey) : value;
    },
    [t]
  );

  const config: CrudConfig<CustomField> = useMemo(
    () => ({
      titleKey: "customField.title",
      subtitleKey: "customField.description",
      resource: "custom-fields",
      // Entity types feed the create form's dropdown; a failed fetch previously left it
      // silently empty with no indication anything was wrong. The Value
      // Types catalog link (Wave 5 row 5.4) is its only entry point --
      // /custom-fields/value-types has no sidebar nav item of its own (that
      // would need a backend nav-seed change, out of this row's frontend-
      // only scope), so it is surfaced here instead.
      customHeaderContent: (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Link href="/custom-fields/value-types">
              <Button variant="outline" size="sm">
                <ListTree className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
                {t("customField.valueTypeCatalog.browseLink")}
              </Button>
            </Link>
            {/* Wave 5 row 5.2. Same reasoning as the value-types link beside
                it: /custom-fields/field-groups has no sidebar nav entry of its
                own (that needs a backend nav-seed change, out of this row's
                frontend-only scope), so the definitions screen is its entry
                point. Gated on the same permission the destination page and its
                backing endpoint require -- offering a link to a page that will
                refuse the caller is a dead end, not a discovery. */}
            {canViewFieldGroups && (
              <Link href="/custom-fields/field-groups">
                <Button variant="outline" size="sm">
                  <FolderTree className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
                  {t("customField.fieldGroupsLink")}
                </Button>
              </Link>
            )}
            {/* Wave 5 row 5.5. Third link, same reasoning as the two beside
                it: /custom-fields/entity-types has no sidebar nav entry of
                its own (nav is backend-seeded, out of this row's
                frontend-only scope), so this screen is its entry point. It
                is the reference page for the Entity Type field the create
                form below asks for, which makes this its natural home. */}
            <Link href="/custom-fields/entity-types">
              <Button variant="outline" size="sm">
                <Boxes className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
                {t("customField.entityTypeCatalog.browseLink")}
              </Button>
            </Link>
            {/* Wave 6 row 6.5. Not a link -- the schema export is an ACTION with
                a scope choice, so it opens a dialog over this screen rather than
                navigating away from the definitions the admin is exporting.
                Gated internally on `custom-fields.export`, the same permission
                the endpoint requires, and renders nothing without it. */}
            <SchemaExportButton />
            {/* Wave 6 row 6.4. The spreadsheet of DEFINITIONS, next to the JSON
                schema bundle because both are exports of this screen's contents
                and an admin looking for one will look for the other in the same
                place. Two separate actions rather than one with a format picker:
                they answer different questions (audit my configuration vs. move
                it to another environment) and only one of them can be refused
                for size. Gated internally on `custom-fields.export`, the same
                permission the endpoint requires, and renders nothing without it. */}
            <DefinitionExportButton />
          </div>
          {isEntityTypesError ? (
            <ErrorMessage
              size="sm"
              message={t("customField.entityTypesLoadFailed")}
              onRetry={() => refetchEntityTypes()}
            />
          ) : isPlatformContext ? (
            <Alert variant="info">
              <Globe2 />
              <AlertTitle>{t("customField.platformContext.title")}</AlertTitle>
              <AlertDescription>{t("customField.platformContext.description")}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      ),
      columns: [
        { key: "entityTypeKey", label: t("customField.fields.entityTypeKey"), sortable: true },
        { key: "key", label: t("customField.fields.key"), sortable: true },
        { key: "labelEn", label: t("customField.fields.labelEn"), sortable: true },
        {
          key: "isGlobal",
          label: t("customField.fields.scope"),
          render: (value: boolean) =>
            value ? <Badge variant="outline">{t("customField.global")}</Badge> : null,
        },
        {
          key: "valueType",
          label: t("customField.fields.valueType"),
          render: (value: string) => (
            <Badge
              variant={
                VALUE_TYPE_CATALOG[value as CustomFieldValueTypeName]?.badgeVariant ?? "secondary"
              }
            >
              {valueTypeLabelOf(value)}
            </Badge>
          ),
        },
        {
          key: "isRequired",
          label: t("customField.fields.isRequired"),
          render: (value: boolean) => (
            <Badge variant={value ? "info" : "secondary"}>
              {value ? t("customField.required") : t("customField.optional")}
            </Badge>
          ),
        },
        { key: "sortOrder", label: t("customField.fields.sortOrder"), sortable: true },
        {
          key: "isActive",
          label: t("customField.fields.isActive"),
          render: (value: boolean) => (
            <Badge variant={value ? "active" : "inactive"}>
              {value ? t("common.yes") : t("common.no")}
            </Badge>
          ),
        },
        {
          key: "createdAt",
          label: t("common.createdAt"),
          render: (value: string) =>
            value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
        },
      ],
      createFields: [
        {
          name: "entityTypeKey",
          label: t("customField.fields.entityTypeKey"),
          type: "select" as const,
          options: entityTypeOptions,
          placeholder: t("customField.placeholders.entityTypeKey"),
          required: true,
          description: noFrontendScreenDescription,
          // Wave 5 row 5.2 -- drives the field-group picker's option list and
          // clears a stale cross-entity-type group selection.
          onChange: handleEntityTypeChange,
        },
        {
          name: "key",
          label: t("customField.fields.key"),
          type: "text" as const,
          placeholder: t("customField.placeholders.key"),
          required: true,
        },
        {
          name: "labelEn",
          label: t("customField.fields.labelEn"),
          type: "text" as const,
          placeholder: t("customField.placeholders.labelEn"),
          required: true,
        },
        {
          name: "labelAr",
          label: t("customField.fields.labelAr"),
          type: "text" as const,
          placeholder: t("customField.placeholders.labelAr"),
        },
        {
          name: "valueType",
          label: t("customField.fields.valueType"),
          type: "select" as const,
          options: valueTypeOptions,
          required: true,
        },
        {
          name: "placeholderEn",
          label: t("customField.fields.placeholderEn"),
          type: "text" as const,
          placeholder: t("customField.placeholders.placeholderEn"),
          // No placeholder concept for a Switch (Boolean) or DatePicker (Date)
          // input -- restrict to the value types that actually render a text
          // input the user types into (Text/Number/Select). A miss (unset/
          // invalid valueType, e.g. before the user has picked one yet)
          // falls back to `true` -- matches the old
          // `!NO_PLACEHOLDER_VALUE_TYPES.has(String(form.valueType))`, which
          // evaluated to `true` (show) for an unset value, since
          // String(undefined) is never in the Set.
          isVisible: (form: Record<string, unknown>) =>
            VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
        },
        {
          name: "placeholderAr",
          label: t("customField.fields.placeholderAr"),
          type: "text" as const,
          placeholder: t("customField.placeholders.placeholderAr"),
          isVisible: (form: Record<string, unknown>) =>
            VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
        },
        {
          name: "validatorKind",
          label: t("customField.fields.validatorKind"),
          type: "select" as const,
          options: validatorKindOptions,
          description: t("customField.validatorKindDescription"),
          // D5: admin-definition-form only, and D4: Text value type only --
          // this catalog exists solely for the Text handler's dispatch, same
          // conditional-visibility mechanism the Options field below uses
          // for Select. Literal "Text" comparison, not a catalog lookup,
          // because this feature is inherently Text-specific rather than a
          // per-value-type property every type carries an opinion on.
          isVisible: (form: Record<string, unknown>) => form.valueType === "Text",
        },
        ...validatorParamFields,
        // Wave 4 follow-up. Sits next to the validator picker rather than beside the entity-type
        // select at the top, because the two are the same kind of thing: a per-value-type
        // configuration that is only meaningful for one value type and is hidden for every other.
        // Putting it at the top would place a field about REFERENCES immediately below the field
        // about which entity the definition is FOR, which are opposite directions of the same word.
        referenceTargetFields.create,
        {
          name: "options",
          label: t("customField.fields.options"),
          // Wave 5 follow-up: was a "one option per line" textarea, which could not express an Arabic
          // label at all, gave no affordance for adding or removing a single option, and turned a
          // stray blank line into a silently dropped option. The control writes BOTH newline lists
          // (see pairedName) so they cannot be persisted out of alignment.
          type: "bilingual-options" as const,
          pairedName: "optionsAr",
          placeholder: t("customField.placeholders.optionEn"),
          searchPlaceholder: t("customField.placeholders.optionAr"),
          addLabel: t("customField.actions.addOption"),
          removeLabel: t("customField.actions.removeOption"),
          emptyHint: t("customField.placeholders.optionsEmpty"),
          // A miss falls back to `false` -- matches the old
          // `String(form.valueType) === SELECT_VALUE_TYPE`, which was
          // already `false` (hide) for an unset value.
          isVisible: (form: Record<string, unknown>) =>
            VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasOptions ?? false,
        },
        {
          name: "isRequired",
          label: t("customField.fields.isRequired"),
          type: "switch" as const,
        },
        {
          ...fieldGroupField,
          isVisible: makeFieldGroupPickerVisibility({
            canView: canViewFieldGroups,
            requireEntityType: true,
          }),
        },
        {
          name: "sortOrder",
          label: t("customField.fields.sortOrder"),
          type: "number" as const,
          min: 0,
        },
        ...classificationFields,
        {
          name: "isGlobal",
          label: t("customField.fields.isGlobal"),
          type: "switch" as const,
          // Only a Super Admin can ever create a global definition (backend
          // independently re-checks this -- see globalRequiresSuperAdmin).
          // In pure platform context there's no tenant to scope to, so every
          // definition is global regardless of this switch's value; shown
          // disabled+on there rather than hidden, so the dialog itself says
          // so instead of relying on the page-level banner behind it, which
          // this modal covers. Only genuinely a *choice* -- and so only
          // interactive -- when a Super Admin has drilled into a specific
          // tenant and could otherwise create a merely-tenant-scoped field.
          isVisible: () => isSuperAdmin,
          disabled: isPlatformContext,
          description: isPlatformContext
            ? t("customField.isGlobalDescription.platformContext")
            : t("customField.isGlobalDescription.tenantContext"),
        },
      ],
      // Not offered on edit: scope is a create-time decision only, same as
      // entityTypeKey/key below -- changing which tenants a live definition
      // applies to after values may already exist against it is a materially
      // different, unrequested feature, not a form-field oversight.
      //
      // entityTypeKey and key are IMMUTABLE after creation (backend rejects changes),
      // so they are omitted from the edit form.
      editFields: [
        { name: "id", type: "hidden" as const, required: true },
        // ValueType itself is immutable post-creation (not submitted here --
        // UpdateCustomFieldCommand has no ValueType field), but the
        // placeholder fields' isVisible below needs to know what it currently
        // is, same reason "id" is carried as hidden state rather than looked
        // up separately.
        { name: "valueType", type: "hidden" as const },
        {
          name: "labelEn",
          label: t("customField.fields.labelEn"),
          type: "text" as const,
          placeholder: t("customField.placeholders.labelEn"),
          required: true,
        },
        {
          name: "labelAr",
          label: t("customField.fields.labelAr"),
          type: "text" as const,
          placeholder: t("customField.placeholders.labelAr"),
        },
        {
          name: "placeholderEn",
          label: t("customField.fields.placeholderEn"),
          type: "text" as const,
          placeholder: t("customField.placeholders.placeholderEn"),
          isVisible: (form: Record<string, unknown>) =>
            VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
        },
        {
          name: "placeholderAr",
          label: t("customField.fields.placeholderAr"),
          type: "text" as const,
          placeholder: t("customField.placeholders.placeholderAr"),
          isVisible: (form: Record<string, unknown>) =>
            VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
        },
        {
          name: "validatorKind",
          label: t("customField.fields.validatorKind"),
          type: "select" as const,
          options: validatorKindOptions,
          description: t("customField.validatorKindDescription"),
          // Same D5/D4 reasoning as the create form's identical field above.
          isVisible: (form: Record<string, unknown>) => form.valueType === "Text",
        },
        ...validatorParamFields,
        // Wave 4 follow-up, and MANDATORY on this form rather than optional -- same reasoning as the
        // field-group picker further down. `UpdateCustomFieldCommandHandler` assigns
        // `entity.ReferenceTargetEntityTypeKey` from the gate's output on every update with no
        // "absent means unchanged" semantics, so a form that omitted this field would submit no pin
        // and silently UNPIN the definition on every unrelated save -- turning a deliberate "this
        // field holds an Employee" into "this field holds anything". That is the Wave 2.5 C-1 defect
        // exactly, which is also why `CustomFieldResponse` returns the current pin and why
        // `buildCustomFieldEditInitialValues` seeds it.
        //
        // The EDIT copy differs from the create copy only in its helper text, which adds what
        // re-pointing a live definition does: nothing to values already stored (each keeps its own
        // target type and still resolves), but the next save of a record holding an old-type value is
        // REFUSED by `EntityReferenceValueTypeHandler.Validate` with
        // `customFields.values.referenceTargetTypeMismatch`. No migration is offered here and none is
        // implied -- the backend deliberately does not refuse the re-point (its own comment: refusing
        // would mean a mis-pinned field could never be corrected without deleting real data), so the
        // only honest thing this form can do is say what the next save will do.
        referenceTargetFields.edit,
        {
          name: "options",
          label: t("customField.fields.options"),
          // Wave 5 follow-up: was a "one option per line" textarea, which could not express an Arabic
          // label at all, gave no affordance for adding or removing a single option, and turned a
          // stray blank line into a silently dropped option. The control writes BOTH newline lists
          // (see pairedName) so they cannot be persisted out of alignment.
          type: "bilingual-options" as const,
          pairedName: "optionsAr",
          placeholder: t("customField.placeholders.optionEn"),
          searchPlaceholder: t("customField.placeholders.optionAr"),
          addLabel: t("customField.actions.addOption"),
          removeLabel: t("customField.actions.removeOption"),
          emptyHint: t("customField.placeholders.optionsEmpty"),
          // Missing on this (edit) form until now -- unlike the create form's
          // identical field above, which has always had this guard. Editing a
          // Text/Number/Boolean/Date field showed an editable Options textarea
          // that UpdateCustomFieldCommandHandler's Select<->Options coupling
          // check then rejected on submit (design doc recon finding #1).
          // Pinned by CustomFieldListView.optionsVisibility.test.tsx.
          isVisible: (form: Record<string, unknown>) =>
            VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasOptions ?? false,
        },
        {
          name: "isRequired",
          label: t("customField.fields.isRequired"),
          type: "switch" as const,
        },
        // Always rendered on edit: the definition's entityTypeKey is already
        // known (immutable, and carried on the hydrated editingItem), so
        // unlike the create form there is no "pick an entity type first"
        // state to guard against. This field MUST be present -- omitting it
        // would submit no fieldGroupId, and UpdateCustomFieldCommandHandler
        // reads that as "ungroup this field", silently detaching the group on
        // every unrelated edit. Exactly the shape of the Wave 2.5 C-1 defect.
        fieldGroupField,
        {
          name: "sortOrder",
          label: t("customField.fields.sortOrder"),
          type: "number" as const,
          min: 0,
        },
        ...classificationFields,
        {
          name: "isActive",
          label: t("customField.fields.isActive"),
          type: "switch" as const,
        },
      ],
      createInitialValues: {
        entityTypeKey: "",
        key: "",
        labelEn: "",
        labelAr: "",
        placeholderEn: "",
        placeholderAr: "",
        valueType: "Text",
        // Wave 6 ruling R10. These MUST match the server's defaults: a create form seeding
        // isExportable=false would make every new field non-exportable, which is precisely the
        // zero-column export defect R10 identified.
        sensitivity: "None",
        isExportable: true,
        validatorKind: "",
        validatorParam: "",
        // "" is the "no group" sentinel; the backend reads empty and absent
        // identically, so a field created without touching the picker is
        // simply ungrouped.
        fieldGroupId: "",
        // Wave 4 follow-up. Seeded for EVERY value type, not only the reference ones, and that is
        // what makes the picker's `isVisible` guard safe: `GenericForm` submits a raw spread of form
        // state, so a key absent from these initial values would never reach the payload at all -- not
        // even when the admin has selected EntityReference and used the picker, since `isVisible`
        // controls rendering, not form state. Sending `""` for a Text or Boolean definition is
        // accepted, not refused: `ReferenceTargetOwnership.NormalizeTargetEntityType` treats a blank
        // submission as "unpinned" before it ever asks whether the value type could carry a pin.
        [REFERENCE_TARGET_FIELD_NAME]: UNPINNED_REFERENCE_TARGET,
        options: "",
        isRequired: false,
        sortOrder: 0,
        // True in pure platform context: honest default (see the field's own
        // disabled/description logic above -- it's not a real choice there).
        // False when drilled into a tenant: don't default to leaking a field
        // into every other tenant, require an explicit opt-in.
        isGlobal: isPlatformContext,
      },
      // Extracted to its own module during the Step 2.5 fix round (C-1) so a
      // test can run the REAL builder against a REAL entity instead of
      // regex-matching this file's source for `item.validatorKind ?? ""` --
      // which is precisely how C-1 shipped with every test green. Every `??
      // ""` in there BLANKS the corresponding column on the next save, so the
      // item it receives must be a detail fetch, never a list row; that is
      // guaranteed by useCustomFieldViewModel's own openEditModal.
      editInitialValues: buildCustomFieldEditInitialValues,
      // labelEn is the genuinely human-readable field; key is the technical
      // fallback for the (rare) record missing a label.
      getItemDisplayName: (item: CustomField) => item.labelEn || item.key,
      deleteService: (id: string) => vm.deleteItem(id),
      // handleDeleteFn is deliberately unused: the delete action below routes through the
      // impact flow instead of the generic confirm dialog. Kept in the signature because it is
      // positional.
      getActions: (_vmInstance, tFn, _handleDeleteFn): CrudAction<CustomField>[] => [
        {
          label: tFn("common.edit"),
          onClick: (item: CustomField) => vm.openEditModal(item),
          variant: "ghost" as const,
          icon: <Pencil className="h-4 w-4" />,
          // A global definition (TenantId == null) is visible to every tenant
          // -- the tenant filter admits it -- but only a platform principal
          // (no tenant context) can ever mutate it; UpdateCustomFieldCommandHandler's
          // ownership guard rejects any tenant-scoped caller with the same
          // "not found" it uses for a genuinely missing row, since the two
          // cases must not be distinguishable from the response (no leaking
          // existence across tenants). Offering Edit/Delete on a row the
          // backend will unconditionally reject isn't a softer failure mode,
          // it's a confusing one -- hide both instead of letting the click
          // round-trip into an error.
          show: (item: CustomField) => isPlatformContext || !item.isGlobal,
        },
        {
          label: tFn("customField.impact.actionLabel"),
          onClick: (item: CustomField) => openUsage(item.id),
          variant: "ghost" as const,
          icon: <BarChart3 className="h-4 w-4" />,
          show: () => canViewUsage,
        },
        {
          label: tFn("customField.history.actionLabel"),
          onClick: (item: CustomField) => openHistory(item.id),
          variant: "ghost" as const,
          icon: <History className="h-4 w-4" />,
          show: () => canViewHistory,
        },
        {
          label: tFn("common.delete"),
          // Deliberately NOT handleDeleteFn. The generic confirm dialog asks "are you sure?" with no
          // numbers; this flow fetches the real impact first and only asks when there is something to
          // lose -- and when there is, it shows what. Two confirmations for one delete would be worse
          // than either alone, so the generic one is bypassed rather than layered.
          onClick: async (item: CustomField) => {
            const deleted = await requestDelete(item.id);
            if (deleted) await vm.refreshItems();
          },
          variant: "ghost" as const,
          className: "text-destructive hover:text-destructive/80",
          icon: <Trash2 className="h-4 w-4" />,
          show: (item: CustomField) => isPlatformContext || !item.isGlobal,
        },
      ],
    }),
    [
      t,
      language,
      // Wave 6 ruling R10. Safe to depend on precisely because it is memoized on [t] -- an
      // unmemoized array literal here would recompute this whole config on every render.
      classificationFields,
      // Wave 6 rows 6.6/6.3. The individual CALLBACKS, not the `insight` object -- that object is a
      // fresh literal on every render (only its callbacks are memoized), so depending on it would
      // recompute this whole config every render.
      openUsage,
      openHistory,
      requestDelete,
      canViewHistory,
      canViewUsage,
      entityTypeOptions,
      noFrontendScreenDescription,
      valueTypeOptions,
      valueTypeLabelOf,
      validatorKindOptions,
      validatorParamFields,
      // Wave 4 follow-up. Safe to depend on for the same reason `classificationFields` is: it is
      // memoized on its own inputs, so the identity only changes when the option list, the language
      // or the query's state actually changes.
      referenceTargetFields,
      fieldGroupField,
      canViewFieldGroups,
      handleEntityTypeChange,
      vm,
      isEntityTypesError,
      refetchEntityTypes,
      isSuperAdmin,
      isPlatformContext,
    ]
  );

  // Rendered as SIBLINGS of the CRUD view rather than inside its config, because both are
  // page-level overlays driven by state this component owns -- GenericCrudView has no slot for a
  // dialog it does not manage, and threading them through it would couple the generic view to two
  // CustomFields-specific concerns.
  // Resolves an id back to a display label from the rows already loaded. Falls back to an empty
  // string rather than the raw id: an encrypted id in a dialog title is noise, and the dialog is
  // always opened from a row the user just clicked, so the label is present in practice.
  const insightFieldLabel = useCallback(
    (fieldId: string | null): string => {
      if (!fieldId) return "";
      const row = (vm.items as CustomField[] | undefined)?.find((item) => item.id === fieldId);
      return row ? row.labelEn || row.key : "";
    },
    [vm.items]
  );

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />

      <FieldHistoryDialog
        open={insight.historyFieldId !== null}
        onOpenChange={(open) => {
          if (!open) insight.closeHistory();
        }}
        fieldLabel={insightFieldLabel(insight.historyFieldId)}
        history={insight.history}
        isLoading={insight.isHistoryLoading}
        isError={insight.isHistoryError}
        errorMessage={insight.historyErrorMessage}
        page={insight.historyPage}
        onPageChange={insight.setHistoryPage}
      />

      <FieldImpactDialog
        open={insight.usageFieldId !== null}
        onOpenChange={(open) => {
          if (!open) insight.closeUsage();
        }}
        fieldLabel={insightFieldLabel(insight.usageFieldId)}
        usage={insight.usage}
        isLoading={insight.isUsageLoading}
        isError={insight.isUsageError}
        // Confirm mode ONLY when this dialog was opened by a delete. Opened from the row action it
        // is informational, and attaching a destructive button to an informational view is how
        // someone deletes a field they only wanted to inspect.
        onConfirmDelete={
          insight.isConfirmingDelete && insight.usageFieldId !== null
            ? async () => {
                await insight.confirmDelete(insight.usageFieldId!);
                await vm.refreshItems();
              }
            : undefined
        }
      />
    </>
  );
});
