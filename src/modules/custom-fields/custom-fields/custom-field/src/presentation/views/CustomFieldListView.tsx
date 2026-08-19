/**
 * CustomField List View
 *
 * Pure UI component for displaying the CustomField definition list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useCustomFieldViewModel } from "../viewmodels/useCustomFieldViewModel";
import type { CustomField } from "../../domain/entities/CustomField";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { ErrorMessage } from "@core/ui/error-message";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { resolveIntlLocale } from "@core/common/utils";
import { Pencil, Trash2, Globe2, ListTree, FolderTree } from "lucide-react";
import {
  VALUE_TYPE_CATALOG,
  ALL_VALUE_TYPES,
  type CustomFieldValueTypeName,
} from "../valueTypeRegistry";
import { VALIDATOR_KIND_CATALOG, ALL_VALIDATOR_KINDS } from "../validatorKindRegistry";
import { buildCustomFieldEditInitialValues } from "../customFieldEditInitialValues";
import { useFieldGroupOptions } from "../../../../field-group/src/presentation/viewmodels/useFieldGroupOptions";
import { buildFieldGroupField, isFieldGroupPickerVisible } from "../fieldGroupFieldConfig";

// Single source of truth for per-value-type presentation metadata (badge
// tone, placeholder/options applicability, display label) -- see
// valueTypeRegistry.ts. Previously this file (and InlineAddCustomFieldDialog.tsx,
// independently) hardcoded SELECT_VALUE_TYPE/NO_PLACEHOLDER_VALUE_TYPES/
// VALUE_TYPE_VARIANTS/valueTypeOptions/valueTypeLabels separately, and the
// edit form's `options` field visibility guard was missing entirely in one
// of the two copies -- see CustomFieldListView.optionsVisibility.test.tsx.

export const CustomFieldListView = React.memo(function CustomFieldListView() {
  useModuleLocales(() => import("../../../locales"), "customFields");
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
  const {
    options: fieldGroupOptions,
    isLoading: isFieldGroupsLoading,
    isError: isFieldGroupsError,
  } = useFieldGroupOptions(activeEntityTypeKey);

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
    setTimeout(() => setCreateEntityTypeKey(key), 0);
    return { fieldGroupId: "" };
  }, []);

  const entityTypeOptions = useMemo(() => {
    if (!entityTypes || entityTypes.length === 0) return [];
    // Screen-backed entities first, API-only ones after -- native <select>/
    // GenericSelect has no optgroup primitive here, so the grouping is done
    // by sort order plus a label suffix rather than a visual divider. `?? true`
    // matches an older backend response that omits the field (treat as
    // screen-backed, the pre-this-feature default) rather than mislabeling
    // every entity type as API-only.
    const onScreen = entityTypes.filter((item) => item.hasFrontendScreen ?? true);
    const apiOnly = entityTypes.filter((item) => !(item.hasFrontendScreen ?? true));
    const toOption = (item: (typeof entityTypes)[number], suffix?: string) => ({
      value: item.key,
      label: `${language === "ar" ? item.displayNameAr : item.displayNameEn} (${item.key})${suffix ?? ""}`,
    });
    return [
      ...onScreen.map((item) => toOption(item)),
      ...apiOnly.map((item) => toOption(item, ` — ${t("customField.entityTypeGroups.apiOnly")}`)),
    ];
  }, [entityTypes, language, t]);

  // Keyed for an O(1) lookup from the form's live entityTypeKey selection --
  // backs the "no screen yet" warning below.
  const entityTypesByKey = useMemo(() => {
    const map = new Map<string, (typeof entityTypes)[number]>();
    for (const item of entityTypes ?? []) map.set(item.key, item);
    return map;
  }, [entityTypes]);

  const noFrontendScreenDescription = useMemo(() => {
    const apiOnlyEntities = (entityTypes ?? []).filter((item) => !(item.hasFrontendScreen ?? true));
    if (apiOnlyEntities.length === 0) return undefined;
    // Static, always-visible note rather than a live per-selection popup --
    // GenericForm has no "computed text tied to another field's current
    // value" primitive today. Combined with the label suffix above (which
    // IS per-option), this still tells an admin, before they pick anything,
    // that some entries in the list won't render on any screen yet.
    const names = apiOnlyEntities
      .map((item) => (language === "ar" ? item.displayNameAr : item.displayNameEn))
      .join(", ");
    return t("customField.noFrontendScreenWarning", { entity: names });
  }, [entityTypes, language, t]);

  const valueTypeOptions = useMemo(
    () => ALL_VALUE_TYPES.map((type) => ({ value: type, label: t(VALUE_TYPE_CATALOG[type].labelKey) })),
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
  const fieldGroupField = useMemo(
    () =>
      buildFieldGroupField({
        t,
        options: fieldGroupOptions,
        isLoading: isFieldGroupsLoading,
        isError: isFieldGroupsError,
      }),
    [t, fieldGroupOptions, isFieldGroupsLoading, isFieldGroupsError]
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
                point. */}
            <Link href="/custom-fields/field-groups">
              <Button variant="outline" size="sm">
                <FolderTree className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
                {t("customField.fieldGroupsLink")}
              </Button>
            </Link>
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
            <Badge variant={VALUE_TYPE_CATALOG[value as CustomFieldValueTypeName]?.badgeVariant ?? "secondary"}>
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
        {
          name: "options",
          label: t("customField.fields.options"),
          type: "textarea" as const,
          placeholder: t("customField.placeholders.options"),
          rows: 4,
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
        { ...fieldGroupField, isVisible: isFieldGroupPickerVisible },
        {
          name: "sortOrder",
          label: t("customField.fields.sortOrder"),
          type: "number" as const,
          min: 0,
        },
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
        {
          name: "options",
          label: t("customField.fields.options"),
          type: "textarea" as const,
          placeholder: t("customField.placeholders.options"),
          rows: 4,
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
        validatorKind: "",
        validatorParam: "",
        // "" is the "no group" sentinel; the backend reads empty and absent
        // identically, so a field created without touching the picker is
        // simply ungrouped.
        fieldGroupId: "",
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
      getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<CustomField>[] => [
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
          label: tFn("common.delete"),
          onClick: (item: CustomField) => handleDeleteFn?.(item),
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
      entityTypeOptions,
      valueTypeOptions,
      valueTypeLabelOf,
      validatorKindOptions,
      validatorParamFields,
      fieldGroupField,
      handleEntityTypeChange,
      vm,
      isEntityTypesError,
      refetchEntityTypes,
      isSuperAdmin,
      isPlatformContext,
    ]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
});
