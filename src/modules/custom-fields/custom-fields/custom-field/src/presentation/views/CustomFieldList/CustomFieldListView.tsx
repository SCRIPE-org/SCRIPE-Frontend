/**
 * Custom Field List View
 *
 * Primary administrative view for managing custom field definitions.
 * Provides definition listing, filtering, create/edit workflows, and action dialogs.
 */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GenericCrudView, type CrudConfig } from "@core/crud/components/generic-crud-view";
import { useCustomFieldViewModel } from "../../viewmodels/useCustomFieldViewModel";
import type { CustomField } from "../../../domain/entities/CustomField";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { usePermission } from "@core/hooks/use-permission";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../../permission-constants";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { Button } from "@core/ui/button";
import { ErrorMessage } from "@core/ui/error-message";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Boxes, FolderTree, Globe2, Layers, ListTree, ShieldCheck } from "lucide-react";
import { VALUE_TYPE_CATALOG, ALL_VALUE_TYPES, type CustomFieldValueTypeName } from "../../registries/valueTypeRegistry";
import { VALIDATOR_KIND_CATALOG, ALL_VALIDATOR_KINDS } from "../../registries/validatorKindRegistry";
import { buildCustomFieldEditInitialValues } from "../../form/customFieldEditInitialValues";
import { buildCustomFieldScopeField, getInitialCustomFieldScope } from "../../form/customFieldScopeFieldConfig";
import { useFieldGroupOptions } from "../../../../../field-group/src/presentation/viewmodels/useFieldGroupOptions";
import { buildFieldGroupField, makeFieldGroupPickerVisibility } from "../../form/fieldGroupFieldConfig";
import { useEntityLookupAvailableTypes } from "../../../../../entity-lookup/src/presentation/hooks/useEntityLookupAvailableTypes";
import { useCustomFieldSubFeatures } from "../../viewmodels/useCustomFieldSubFeatures";
import { CustomFieldExportButtons } from "./CustomFieldExportButtons";
import { readWireString, formatRegistryTypeOptionLabel, type RegistryNamedType } from "../../utils/registryTypeFormatting";
import {
  REFERENCE_TARGET_FIELD_NAME, UNPINNED_REFERENCE_TARGET, isReferenceTargetPickerVisible,
  buildReferenceTargetField, type BuildReferenceTargetFieldArgs,
} from "../../form/referenceTargetFieldConfig";
import { CustomFieldDialogsContainer } from "./CustomFieldDialogsContainer";
import { buildCustomFieldColumns, buildCustomFieldActions } from "./customFieldColumns";
import {
  buildCreateIdentityFields, buildEditIdentityFields, buildOptionSetSelectionFields,
  buildClassificationFields, buildCreateLayoutFields, buildEditLayoutFields,
} from "../../form/customFieldFormSections";

export type { RegistryNamedType, BuildReferenceTargetFieldArgs };
export { readWireString, formatRegistryTypeOptionLabel, REFERENCE_TARGET_FIELD_NAME, UNPINNED_REFERENCE_TARGET, isReferenceTargetPickerVisible, buildReferenceTargetField };

export function resolveRegistryTypeName(type: RegistryNamedType, language: string): string | undefined {
  const active = language === "ar" ? type?.displayNameAr : type?.displayNameEn;
  const other = language === "ar" ? type?.displayNameEn : type?.displayNameAr;
  return readWireString(active) ?? readWireString(other);
}

export const CustomFieldListView = React.memo(function CustomFieldListView() {
  useModuleLocales(() => import("../../../../locales"), "customFields");
  useModuleLocales(() => import("../../../../../option-set/locales"), "customFieldOptionSets");
  const { t, language } = useI18n();
  const { vm, entityTypes, isEntityTypesError, refetchEntityTypes } = useCustomFieldViewModel();
  const { isSuperAdmin } = usePermissions();
  const { isInTenantWorld } = useTenantContext();
  const isPlatformContext = isSuperAdmin && !isInTenantWorld;

  const [createEntityTypeKey, setCreateEntityTypeKey] = useState("");
  const activeEntityTypeKey = vm.isEditModalOpen && vm.editingItem ? vm.editingItem.entityTypeKey : createEntityTypeKey;

  const subFeatures = useCustomFieldSubFeatures(isSuperAdmin);
  const canViewOptionSets = usePermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_VIEW) || isSuperAdmin;
  const canManageKeys = usePermission(CUSTOM_FIELDS_PERMISSIONS.MANAGE_KEYS) || isSuperAdmin;
  const { canViewFieldGroups, canViewHistory, canViewUsage, canUpdate, canDelete } = subFeatures;

  const { options: fieldGroupOptions, isLoading: isFieldGroupsLoading, isError: isFieldGroupsError } =
    useFieldGroupOptions(activeEntityTypeKey, { enabled: canViewFieldGroups });

  const entityTypeDeferRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (entityTypeDeferRef.current !== null) clearTimeout(entityTypeDeferRef.current); }, []);

  const handleEntityTypeChange = useCallback((value: unknown) => {
    const key = typeof value === "string" ? value : "";
    if (entityTypeDeferRef.current !== null) clearTimeout(entityTypeDeferRef.current);
    entityTypeDeferRef.current = setTimeout(() => setCreateEntityTypeKey(key), 0);
    return { fieldGroupId: "" };
  }, []);

  const entityTypeOptions = useMemo(() => {
    const available = Array.isArray(entityTypes) ? entityTypes : [];
    const usable = available.filter((item) => readWireString(item?.key) !== undefined);
    return [
      ...usable.filter((item) => item.hasFrontendScreen ?? true).map((item) => ({
        value: item.key, label: formatRegistryTypeOptionLabel(item, language),
      })),
      ...usable.filter((item) => !(item.hasFrontendScreen ?? true)).map((item) => ({
        value: item.key, label: `${formatRegistryTypeOptionLabel(item, language)} — ${t("customField.entityTypeGroups.apiOnly")}`,
      })),
    ];
  }, [entityTypes, language, t]);

  const noFrontendScreenDescription = useMemo(() => {
    const available = Array.isArray(entityTypes) ? entityTypes : [];
    const apiOnly = available.filter((item) => !(item?.hasFrontendScreen ?? true));
    const names = apiOnly
      .map((item) => resolveRegistryTypeName(item, language) ?? readWireString(item?.key))
      .filter((n): n is string => n !== undefined);
    return names.length > 0 ? t("customField.noFrontendScreenWarning", { entity: names.join(", ") }) : undefined;
  }, [entityTypes, language, t]);

  const valueTypeOptions = useMemo(
    () => ALL_VALUE_TYPES.map((type) => ({ value: type, label: t(VALUE_TYPE_CATALOG[type].labelKey) })), [t]
  );
  const validatorKindOptions = useMemo(
    () => [{ value: "", label: t("customField.validatorKindNone") }, ...ALL_VALIDATOR_KINDS.map((kind) => ({ value: kind, label: t(VALIDATOR_KIND_CATALOG[kind].labelKey) }))],
    [t]
  );

  const validatorParamFields = useMemo(
    () =>
      ALL_VALIDATOR_KINDS.filter((kind) => VALIDATOR_KIND_CATALOG[kind].hasParam).map((kind) => {
        const entry = VALIDATOR_KIND_CATALOG[kind];
        const isClosedSet = entry.supportedParamValues !== undefined;
        return {
          name: "validatorParam", label: t("customField.fields.validatorParam"), type: (isClosedSet ? "select" : "text") as "select" | "text",
          placeholder: isClosedSet ? undefined : t(entry.paramHintKey as string), description: t(entry.paramHintKey as string),
          options: isClosedSet ? entry.supportedParamValues!.map((code) => ({ value: code, label: code })) : undefined,
          isVisible: (form: Record<string, unknown>) => form.valueType === "Text" && form.validatorKind === kind,
        };
      }), [t]
  );

  const classificationFields = useMemo(() => buildClassificationFields(t), [t]);

  const {
    types: referenceTargetTypes, isLoading: isReferenceTargetTypesLoading,
    isError: isReferenceTargetTypesError, isEmpty: isReferenceTargetTypesEmpty,
  } = useEntityLookupAvailableTypes();

  const referenceTargetFields = useMemo(() => {
    const shared = { t, language, types: referenceTargetTypes, isLoading: isReferenceTargetTypesLoading, isError: isReferenceTargetTypesError, isEmpty: isReferenceTargetTypesEmpty };
    return {
      create: { ...buildReferenceTargetField({ ...shared, isExistingDefinition: false }), section: t("customField.formSections.typeAndValidation") },
      edit: { ...buildReferenceTargetField({ ...shared, isExistingDefinition: true }), section: t("customField.formSections.typeAndValidation") },
    };
  }, [t, language, referenceTargetTypes, isReferenceTargetTypesLoading, isReferenceTargetTypesError, isReferenceTargetTypesEmpty]);

  const fieldGroupField = useMemo(() => ({
    ...buildFieldGroupField({ t, options: fieldGroupOptions, isLoading: isFieldGroupsLoading, isError: isFieldGroupsError }),
    section: t("customField.formSections.layout"), isVisible: makeFieldGroupPickerVisibility({ canView: canViewFieldGroups, requireEntityType: false }),
  }), [t, fieldGroupOptions, isFieldGroupsLoading, isFieldGroupsError, canViewFieldGroups]);

  const scopeField = useMemo(() => ({ ...buildCustomFieldScopeField({ t, isPlatformContext }), section: t("customField.formSections.governance") }), [t, isPlatformContext]);
  const valueTypeLabelOf = useMemo(() => (value: string) => VALUE_TYPE_CATALOG[value as CustomFieldValueTypeName] ? t(VALUE_TYPE_CATALOG[value as CustomFieldValueTypeName].labelKey) : value, [t]);

  const bindableSets = subFeatures.optionSetBinding.bindableSets;
  const optionSetOptions = useMemo(() => bindableSets.map((set) => ({
    value: set.publishedVersionId!,
    label: set.isPlatformOwned ? `${set.displayLabel(language)} (${t("customField.optionSetBinding.platformOwned")})` : set.displayLabel(language),
  })), [bindableSets, language, t]);

  const columns = useMemo(
    () => buildCustomFieldColumns({ t, language, isPlatformContext, valueTypeLabelOf }),
    [t, language, isPlatformContext, valueTypeLabelOf]
  );

  const config: CrudConfig<CustomField> = useMemo(
    () => ({
      titleKey: "customField.title",
      subtitleKey: "customField.description",
      resource: "custom-fields",
      customHeaderContent: (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Link href="/custom-fields/value-types"><Button variant="outline" size="sm"><ListTree className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />{t("customField.valueTypeCatalog.browseLink")}</Button></Link>
            {canViewFieldGroups && <Link href="/custom-fields/field-groups"><Button variant="outline" size="sm"><FolderTree className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />{t("customField.fieldGroupsLink")}</Button></Link>}
            {canViewOptionSets && (
              <Link href="/custom-fields/option-sets"><Button variant="outline" size="sm"><Layers className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />{t("optionSet.title")}</Button></Link>
            )}
            <Link href="/custom-fields/entity-types"><Button variant="outline" size="sm"><Boxes className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />{t("customField.entityTypeCatalog.browseLink")}</Button></Link>
            {canManageKeys && (
              <Link href="/custom-fields/security">
                <Button variant="outline" size="sm">
                  <ShieldCheck className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
                  {t("customFieldsSecurity.title")}
                </Button>
              </Link>
            )}
            <CustomFieldExportButtons />
          </div>
          {isEntityTypesError ? (
            <ErrorMessage size="sm" message={t("customField.entityTypesLoadFailed")} onRetry={() => refetchEntityTypes()} />
          ) : isPlatformContext ? (
            <Alert variant="info"><Globe2 /><AlertTitle>{t("customField.platformContext.title")}</AlertTitle><AlertDescription>{t("customField.platformContext.description")}</AlertDescription></Alert>
          ) : null}
        </div>
      ),
      columns,
      createFields: [
        ...buildCreateIdentityFields({ t, entityTypeOptions, noFrontendScreenDescription, handleEntityTypeChange }),
        { name: "valueType", label: t("customField.fields.valueType"), type: "select" as const, section: t("customField.formSections.typeAndValidation"), options: valueTypeOptions, required: true },
        {
          name: "placeholderEn", label: t("customField.fields.placeholderEn"), type: "text" as const,
          section: t("customField.formSections.typeAndValidation"), placeholder: t("customField.placeholders.placeholderEn"),
          isVisible: (form: Record<string, unknown>) => VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
        },
        {
          name: "placeholderAr", label: t("customField.fields.placeholderAr"), type: "text" as const,
          section: t("customField.formSections.typeAndValidation"), placeholder: t("customField.placeholders.placeholderAr"),
          isVisible: (form: Record<string, unknown>) => VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
        },
        {
          name: "validatorKind", label: t("customField.fields.validatorKind"), type: "select" as const,
          section: t("customField.formSections.typeAndValidation"), options: validatorKindOptions,
          description: t("customField.validatorKindDescription"),
          isVisible: (form: Record<string, unknown>) => form.valueType === "Text",
        },
        ...validatorParamFields.map((f) => ({ ...f, section: t("customField.formSections.typeAndValidation") })),
        referenceTargetFields.create,
        ...buildOptionSetSelectionFields({ t, optionSetOptions, isSetsLoading: subFeatures.optionSetBinding.isSetsLoading }),
        {
          name: "options", label: t("customField.fields.options"), type: "bilingual-options" as const,
          section: t("customField.formSections.typeAndValidation"), pairedName: "optionsAr",
          placeholder: t("customField.placeholders.optionEn"), searchPlaceholder: t("customField.placeholders.optionAr"),
          addLabel: t("customField.actions.addOption"), removeLabel: t("customField.actions.removeOption"),
          emptyHint: t("customField.placeholders.optionsEmpty"),
          isVisible: (form: Record<string, unknown>) =>
            Boolean(
              (VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasOptions ?? false) &&
                (form.optionsSource === "custom" || !form.optionsSource)
            ),
        },
        ...buildCreateLayoutFields({ fieldGroupField, classificationFields, t, scopeField }),
      ],
      editFields: [
        ...buildEditIdentityFields(t),
        {
          name: "placeholderEn", label: t("customField.fields.placeholderEn"), type: "text" as const,
          section: t("customField.formSections.typeAndValidation"), placeholder: t("customField.placeholders.placeholderEn"),
          isVisible: (form: Record<string, unknown>) => VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
        },
        {
          name: "placeholderAr", label: t("customField.fields.placeholderAr"), type: "text" as const,
          section: t("customField.formSections.typeAndValidation"), placeholder: t("customField.placeholders.placeholderAr"),
          isVisible: (form: Record<string, unknown>) => VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
        },
        {
          name: "validatorKind", label: t("customField.fields.validatorKind"), type: "select" as const,
          section: t("customField.formSections.typeAndValidation"), options: validatorKindOptions,
          description: t("customField.validatorKindDescription"),
          isVisible: (form: Record<string, unknown>) => form.valueType === "Text",
        },
        ...validatorParamFields.map((f) => ({ ...f, section: t("customField.formSections.typeAndValidation") })),
        referenceTargetFields.edit,
        {
          name: "options", label: t("customField.fields.options"), type: "bilingual-options" as const,
          section: t("customField.formSections.typeAndValidation"), pairedName: "optionsAr",
          placeholder: t("customField.placeholders.optionEn"), searchPlaceholder: t("customField.placeholders.optionAr"),
          addLabel: t("customField.actions.addOption"), removeLabel: t("customField.actions.removeOption"),
          emptyHint: t("customField.placeholders.optionsEmpty"),
          isVisible: (form: Record<string, unknown>) =>
            VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasOptions ?? false,
        },
        ...buildEditLayoutFields({ fieldGroupField, classificationFields, t }),
      ],
      createInitialValues: {
        entityTypeKey: "", key: "", labelEn: "", labelAr: "", placeholderEn: "", placeholderAr: "", valueType: "Text", sensitivity: "None",
        isExportable: true, validatorKind: "", validatorParam: "", fieldGroupId: "", [REFERENCE_TARGET_FIELD_NAME]: UNPINNED_REFERENCE_TARGET,
        optionsSource: "custom", optionSetVersionId: "", options: "", isRequired: false, sortOrder: 0, scope: getInitialCustomFieldScope(isPlatformContext),
      },
      editInitialValues: buildCustomFieldEditInitialValues,
      getItemDisplayName: (item: CustomField) => item.labelEn || item.key,
      deleteService: (id: string) => vm.deleteItem(id),
      getActions: (_vmInstance, tFn) =>
        buildCustomFieldActions(tFn, {
          openDetail: subFeatures.openDetail, openEditModal: (item) => vm.openEditModal(item),
          canUpdate, canDelete, canViewHistory, canViewUsage, canViewOptionSets, isPlatformContext,
          openBinding: subFeatures.optionSetBinding.openBinding, openUsage: subFeatures.insight.openUsage,
          visibilityRulesCanView: subFeatures.visibilityRules.canView, openRules: subFeatures.visibilityRules.openRules,
          convertValueTypeCanUpdate: subFeatures.convertValueType.canUpdate, openConvert: subFeatures.convertValueType.openConvert,
          fieldVersionsCanView: subFeatures.fieldVersions.canView, openVersions: subFeatures.fieldVersions.openVersions,
          openHistory: subFeatures.insight.openHistory, requestDelete: subFeatures.insight.requestDelete,
          refreshItems: () => vm.refreshItems(),
        }),
    }),
    [
      t, language, vm, columns, entityTypeOptions, noFrontendScreenDescription, valueTypeOptions, validatorKindOptions,
      validatorParamFields, referenceTargetFields, fieldGroupField, scopeField, optionSetOptions, isEntityTypesError,
      canViewFieldGroups, canViewOptionSets, canManageKeys, canViewHistory, canViewUsage, canUpdate, canDelete,
      subFeatures, handleEntityTypeChange, refetchEntityTypes, classificationFields,
      isPlatformContext,
    ]
  );

  const items = vm.items as CustomField[] | undefined;
  const insightFieldLabel = useCallback((fieldId: string | null): string => {
    if (!fieldId) return "";
    const row = items?.find((item) => item.id === fieldId);
    return row ? row.labelEn || row.key : "";
  }, [items]);

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />
      <CustomFieldDialogsContainer
        detailFieldId={subFeatures.detailFieldId} closeDetail={subFeatures.closeDetail} insightFieldLabel={insightFieldLabel}
        canUpdate={canUpdate} isPlatformContext={isPlatformContext} vm={vm} insight={subFeatures.insight}
        optionSetBinding={subFeatures.optionSetBinding} visibilityRules={subFeatures.visibilityRules}
        convertValueType={subFeatures.convertValueType} fieldVersions={subFeatures.fieldVersions}
      />
    </>
  );
});
