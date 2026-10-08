"use client";

import React, { useMemo } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@core/ui/dialog";
import { Skeleton } from "@core/ui/skeleton";
import { ScrollArea } from "@core/ui/scroll-area";
import { ErrorMessage } from "@core/ui/error-message";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery } from "@tanstack/react-query";
import { getCustomFieldsContainer } from "../../../../di";
import { parseBilingualOptions } from "@core/ui/forms/bilingual-options-editor";
import { VALUE_TYPE_CATALOG, type CustomFieldValueTypeName } from "../registries/valueTypeRegistry";
import {
  VALIDATOR_KIND_CATALOG,
  type ValidatorKindName,
} from "../registries/validatorKindRegistry";
import type { CustomField } from "../../domain/entities/CustomField";
import { DetailHeader } from "./detail/DetailHeader";
import { DetailGeneralSection } from "./detail/DetailGeneralSection";
import { DetailValidationSection } from "./detail/DetailValidationSection";
import { DetailOptionsSection } from "./detail/DetailOptionsSection";
import { DetailGovernanceSection } from "./detail/DetailGovernanceSection";
import { DetailAuditSection } from "./detail/DetailAuditSection";
import { SENSITIVITY_BADGE_VARIANTS, formatDetailDate } from "./detail/detailHelpers";

/**
 * Documentation for module export
 */
export interface CustomFieldDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldId: string | null;
  /** Optional fallback display label before detail resolves */
  fieldLabel?: string;
  /** Called when user clicks "Edit" from within the dialog */
  onEdit?: (field: CustomField) => void;
  /** Can the current caller edit this field (permission & scope check) */
  canEdit?: boolean;
}

/**
 * CustomFieldDetailDialog -- Comprehensive read-only inspector for custom field definitions.
 * Provides operators and administrators with a structured view of configuration,
 * behavioral rules, allowed options, data classification, and audit timestamps.
 */
export function CustomFieldDetailDialog({
  open,
  onOpenChange,
  fieldId,
  fieldLabel,
  onEdit,
  canEdit = false,
}: CustomFieldDetailDialogProps): React.ReactElement {
  const { t, language, direction } = useI18n();
  const { customFieldRepository, fieldGroupRepository } = getCustomFieldsContainer();

  // Fetch full detail of the targeted custom field
  const {
    data: field,
    isLoading: isFieldLoading,
    isError: isFieldError,
    refetch: refetchField,
  } = useQuery({
    queryKey: ["customFields", "detail", fieldId],
    queryFn: () => customFieldRepository.getById(fieldId!),
    enabled: Boolean(open && fieldId),
    staleTime: 30_000,
  });

  // Fetch entity types for human-friendly entity name resolution
  const { data: entityTypes = [] } = useQuery({
    queryKey: ["customFields", "entityTypes"],
    queryFn: () => customFieldRepository.getEntityTypes(),
    staleTime: 1000 * 60 * 60,
  });

  // Fetch field groups if the targeted field has a field group assigned
  const { data: fieldGroups = [] } = useQuery({
    queryKey: ["customFields", "fieldGroups", field?.entityTypeKey],
    queryFn: () => fieldGroupRepository.getByEntityType(field!.entityTypeKey),
    enabled: Boolean(open && field?.entityTypeKey && field?.fieldGroupId),
    staleTime: 1000 * 60 * 5,
  });

  const entityTypeInfo = field?.entityTypeKey
    ? entityTypes.find((e) => e.key === field.entityTypeKey) ?? null
    : null;

  const entityTypeDisplayName = entityTypeInfo
    ? language === "ar"
      ? entityTypeInfo.displayNameAr || entityTypeInfo.displayNameEn
      : entityTypeInfo.displayNameEn
    : field?.entityTypeKey ?? "—";

  const referenceTargetInfo = field?.referenceTargetEntityTypeKey
    ? entityTypes.find((e) => e.key === field.referenceTargetEntityTypeKey) ?? null
    : null;

  const referenceTargetDisplayName = (() => {
    if (!field?.referenceTargetEntityTypeKey) {
      return t("customField.details.fields.unpinnedReference");
    }
    if (!referenceTargetInfo) return field.referenceTargetEntityTypeKey;
    const localizedName =
      language === "ar"
        ? referenceTargetInfo.displayNameAr || referenceTargetInfo.displayNameEn
        : referenceTargetInfo.displayNameEn;
    return `${localizedName} (${field.referenceTargetEntityTypeKey})`;
  })();

  const fieldGroupName = (() => {
    if (!field?.fieldGroupId) return t("customField.details.fields.noGroup");
    const group = fieldGroups.find((g) => g.id === field.fieldGroupId);
    if (!group) return t("customField.details.fields.noGroup");
    const en = group.labelEn || (group as unknown as { nameEn?: string }).nameEn || "";
    const ar = group.labelAr || (group as unknown as { nameAr?: string }).nameAr || "";
    return language === "ar" ? ar || en : en || t("customField.details.fields.noGroup");
  })();

  const optionsList = useMemo(() => {
    if (!field || (!field.options && !field.optionsAr)) return [];
    return parseBilingualOptions(field.options ?? "", field.optionsAr ?? "");
  }, [field]);

  const valueTypeMeta = field
    ? VALUE_TYPE_CATALOG[field.valueType as CustomFieldValueTypeName]
    : null;
  const valueTypeDisplayName = (() => {
    if (!field) return "";
    if (valueTypeMeta?.labelKey) {
      const translated = t(valueTypeMeta.labelKey);
      if (translated && !translated.startsWith("customField.valueTypes.")) {
        return translated;
      }
    }
    return field.valueType;
  })();

  const validatorMeta = field?.validatorKind
    ? VALIDATOR_KIND_CATALOG[field.validatorKind as ValidatorKindName]
    : null;
  const validatorDisplayName = (() => {
    if (!field?.validatorKind) return t("customField.details.fields.noValidator");
    if (validatorMeta?.labelKey) {
      const translated = t(validatorMeta.labelKey);
      if (translated && !translated.startsWith("customField.validatorKinds.")) {
        return translated;
      }
    }
    return field.validatorKind;
  })();

  const sensitivityLevel = field?.sensitivity ?? "None";
  const sensitivityBadgeVariant = SENSITIVITY_BADGE_VARIANTS[sensitivityLevel] ?? "outline";
  const sensitivityDisplayName = (() => {
    const key = `customField.sensitivity.${sensitivityLevel.toLowerCase()}`;
    const translated = t(key);
    return translated && !translated.startsWith("customField.sensitivity.")
      ? translated
      : sensitivityLevel;
  })();

  const formatDate = (iso?: string | null) => formatDetailDate(iso, language);

  const hasOptions = valueTypeMeta?.hasOptions ?? false;
  const hasPlaceholder = valueTypeMeta?.hasPlaceholder ?? true;
  const isReferenceType = field?.valueType === "EntityReference";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <DetailHeader
          field={field}
          fieldLabel={fieldLabel}
          valueTypeMeta={valueTypeMeta}
          valueTypeDisplayName={valueTypeDisplayName}
          sensitivityBadgeVariant={sensitivityBadgeVariant}
          sensitivityDisplayName={sensitivityDisplayName}
        />

        {isFieldLoading ? (
          <div className="space-y-4 p-6" role="status" aria-label={t("common.loading")}>
            <Skeleton className="h-8 w-3/4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : isFieldError ? (
          <div className="p-6">
            <ErrorMessage
              message={t("customField.details.loadFailed")}
              onRetry={() => refetchField()}
            />
          </div>
        ) : field ? (
          <ScrollArea className="max-h-[65vh] px-6 py-4" dir={direction}>
            <div className="space-y-6">
              <DetailGeneralSection
                field={field}
                entityTypeDisplayName={entityTypeDisplayName}
                fieldGroupName={fieldGroupName}
              />

              <DetailValidationSection
                field={field}
                valueTypeDisplayName={valueTypeDisplayName}
                valueTypeMeta={valueTypeMeta}
                hasPlaceholder={hasPlaceholder}
                isReferenceType={isReferenceType}
                referenceTargetDisplayName={referenceTargetDisplayName}
                validatorDisplayName={validatorDisplayName}
              />

              {hasOptions && <DetailOptionsSection optionsList={optionsList} />}

              <DetailGovernanceSection
                sensitivityBadgeVariant={sensitivityBadgeVariant}
                sensitivityDisplayName={sensitivityDisplayName}
                isExportable={field.isExportable}
              />

              <DetailAuditSection
                createdAt={field.createdAt}
                modifiedAt={field.modifiedAt}
                formatDate={formatDate}
              />
            </div>
          </ScrollArea>
        ) : null}

        <DialogFooter className="border-t bg-muted/20 px-6 py-3.5">
          <div className="flex w-full items-center justify-between gap-2">
            <div>
              {canEdit && field && onEdit && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(field);
                  }}
                >
                  <Pencil className="me-1.5 h-3.5 w-3.5" />
                  {t("common.edit")}
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {t("common.close")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
