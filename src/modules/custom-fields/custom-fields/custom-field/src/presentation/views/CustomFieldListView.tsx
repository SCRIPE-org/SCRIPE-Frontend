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
import { BarChart3, Boxes, FolderTree, Globe2, History, ListTree, Pencil, Trash2 } from "lucide-react";
import {
  VALUE_TYPE_CATALOG,
  ALL_VALUE_TYPES,
  type CustomFieldValueTypeName,
} from "../valueTypeRegistry";
import { VALIDATOR_KIND_CATALOG, ALL_VALIDATOR_KINDS } from "../validatorKindRegistry";
import { buildCustomFieldEditInitialValues } from "../customFieldEditInitialValues";
import { useFieldGroupOptions } from "../../../../field-group/src/presentation/viewmodels/useFieldGroupOptions";
import { buildFieldGroupField, makeFieldGroupPickerVisibility } from "../fieldGroupFieldConfig";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import { usePermission } from "@core/hooks/use-permission";
import { FieldHistoryDialog } from "../FieldHistoryDialog";
import { FieldImpactDialog } from "../FieldImpactDialog";
import { useFieldInsightViewModel } from "../viewmodels/useFieldInsightViewModel";
// Wave 6 row 6.5. Self-contained: it owns its own permission gate, its own open
// state and its own locale chunk, so it adds nothing to the config memo below.
import { SchemaExportButton } from "../../../../schema/src/presentation/components/SchemaExportButton";

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
