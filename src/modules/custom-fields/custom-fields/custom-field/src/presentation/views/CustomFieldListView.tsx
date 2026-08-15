/**
 * CustomField List View
 *
 * Pure UI component for displaying the CustomField definition list with CRUD.
 * Uses GenericCrudView for standard CRUD table UI.
 */
"use client";

import React, { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useCustomFieldViewModel } from "../viewmodels/useCustomFieldViewModel";
import type { CustomField } from "../../domain/entities/CustomField";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { Badge } from "@core/ui/badge";
import { ErrorMessage } from "@core/ui/error-message";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { resolveIntlLocale } from "@core/common/utils";
import { Pencil, Trash2, Globe2 } from "lucide-react";

// Options are only allowed/required for Select fields. Wire value is the
// backend enum's string member name (JsonStringEnumConverter), never its
// ordinal -- see design doc W0-3/GAP 1.
const SELECT_VALUE_TYPE = "Select";

// Boolean/Date are the two value types with no placeholder concept (a Switch
// and a DatePicker, neither renders a text input a placeholder would sit
// inside). Text/Number/Select all keep the field.
const NO_PLACEHOLDER_VALUE_TYPES = new Set(["Boolean", "Date"]);

// CustomFieldValueType wire names mapped onto the nx Badge semantic tones — a
// value type is read-only metadata, so the tones are neutral/informational
// rather than success/error.
const VALUE_TYPE_VARIANTS: Record<
  string,
  "default" | "secondary" | "info" | "success" | "warning"
> = {
  Text: "secondary",
  Number: "info",
  Boolean: "success",
  Date: "warning",
  Select: "default",
};

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
    () => [
      { value: "Text", label: t("customField.valueTypes.text") },
      { value: "Number", label: t("customField.valueTypes.number") },
      { value: "Boolean", label: t("customField.valueTypes.boolean") },
      { value: "Date", label: t("customField.valueTypes.date") },
      { value: "Select", label: t("customField.valueTypes.select") },
    ],
    [t]
  );

  const valueTypeLabels = useMemo<Record<string, string>>(
    () => ({
      Text: t("customField.valueTypes.text"),
      Number: t("customField.valueTypes.number"),
      Boolean: t("customField.valueTypes.boolean"),
      Date: t("customField.valueTypes.date"),
      Select: t("customField.valueTypes.select"),
    }),
    [t]
  );

  const config: CrudConfig<CustomField> = useMemo(
    () => ({
      titleKey: "customField.title",
      subtitleKey: "customField.description",
      resource: "custom-fields",
      // Entity types feed the create form's dropdown; a failed fetch previously left it
      // silently empty with no indication anything was wrong.
      customHeaderContent: isEntityTypesError ? (
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
      ) : undefined,
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
            <Badge variant={VALUE_TYPE_VARIANTS[value] ?? "secondary"}>
              {valueTypeLabels[value] ?? value}
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
          // input the user types into (Text/Number/Select).
          isVisible: (form: Record<string, unknown>) => !NO_PLACEHOLDER_VALUE_TYPES.has(String(form.valueType)),
        },
        {
          name: "placeholderAr",
          label: t("customField.fields.placeholderAr"),
          type: "text" as const,
          placeholder: t("customField.placeholders.placeholderAr"),
          isVisible: (form: Record<string, unknown>) => !NO_PLACEHOLDER_VALUE_TYPES.has(String(form.valueType)),
        },
        {
          name: "options",
          label: t("customField.fields.options"),
          type: "textarea" as const,
          placeholder: t("customField.placeholders.options"),
          rows: 4,
          isVisible: (form: Record<string, unknown>) =>
            String(form.valueType) === SELECT_VALUE_TYPE,
        },
        {
          name: "isRequired",
          label: t("customField.fields.isRequired"),
          type: "switch" as const,
        },
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
          isVisible: (form: Record<string, unknown>) => !NO_PLACEHOLDER_VALUE_TYPES.has(String(form.valueType)),
        },
        {
          name: "placeholderAr",
          label: t("customField.fields.placeholderAr"),
          type: "text" as const,
          placeholder: t("customField.placeholders.placeholderAr"),
          isVisible: (form: Record<string, unknown>) => !NO_PLACEHOLDER_VALUE_TYPES.has(String(form.valueType)),
        },
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
          isVisible: (form: Record<string, unknown>) =>
            String(form.valueType) === SELECT_VALUE_TYPE,
        },
        {
          name: "isRequired",
          label: t("customField.fields.isRequired"),
          type: "switch" as const,
        },
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
        options: "",
        isRequired: false,
        sortOrder: 0,
        // True in pure platform context: honest default (see the field's own
        // disabled/description logic above -- it's not a real choice there).
        // False when drilled into a tenant: don't default to leaking a field
        // into every other tenant, require an explicit opt-in.
        isGlobal: isPlatformContext,
      },
      editInitialValues: (item: CustomField) => ({
        id: item.id,
        valueType: item.valueType,
        labelEn: item.labelEn,
        labelAr: item.labelAr ?? "",
        placeholderEn: item.placeholderEn ?? "",
        placeholderAr: item.placeholderAr ?? "",
        options: item.options ?? "",
        isRequired: item.isRequired,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      }),
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
      valueTypeLabels,
      vm,
      isEntityTypesError,
      refetchEntityTypes,
      isSuperAdmin,
      isPlatformContext,
    ]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
});
