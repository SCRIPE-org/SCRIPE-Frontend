"use client";

/**
 * CustomFieldDetailDialog -- Comprehensive read-only inspector for custom field definitions.
 *
 * Provides operators and administrators with a complete, structured view of any custom field's
 * configuration, behavioral rules, allowed options, data classification, and audit timestamps.
 */

import React, { useMemo } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  FileCode,
  Globe,
  ListFilter,
  Pencil,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  XCircle,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { DetailRow } from "@core/ui/detail-row";
import { Skeleton } from "@core/ui/skeleton";
import { ScrollArea } from "@core/ui/scroll-area";
import { Separator } from "@core/ui/separator";
import { ErrorMessage } from "@core/ui/error-message";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery } from "@tanstack/react-query";
import { getCustomFieldsContainer } from "../../../../di";
import { parseBilingualOptions } from "@core/ui/forms/bilingual-options-editor";
import { VALUE_TYPE_CATALOG, type CustomFieldValueTypeName } from "../registries/valueTypeRegistry";
import {
  VALIDATOR_KIND_CATALOG,
  type ValidatorKindName,
} from "../registries/validatorKindRegistry";
import { resolveIntlLocale } from "@core/common/utils";
import type { CustomField } from "../../domain/entities/CustomField";

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

const SENSITIVITY_BADGE_VARIANTS: Record<
  string,
  "outline" | "secondary" | "warning" | "destructive"
> = {
  None: "outline",
  Internal: "secondary",
  Confidential: "warning",
  Restricted: "destructive",
};

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

  // Fetch full detail of the targeted custom field (options, validators, placeholders, etc.)
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

  // Resolve localized entity type name
  const entityTypeInfo = field?.entityTypeKey
    ? entityTypes.find((e) => e.key === field.entityTypeKey) ?? null
    : null;

  const entityTypeDisplayName = entityTypeInfo
    ? language === "ar"
      ? entityTypeInfo.displayNameAr || entityTypeInfo.displayNameEn
      : entityTypeInfo.displayNameEn
    : field?.entityTypeKey ?? "—";

  // Resolve reference target entity type name if pinned
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

  // Resolve assigned field group name
  const fieldGroupName = (() => {
    if (!field?.fieldGroupId) return t("customField.details.fields.noGroup");
    const group = fieldGroups.find((g) => g.id === field.fieldGroupId);
    if (!group) return t("customField.details.fields.noGroup");
    const en = group.labelEn || (group as unknown as { nameEn?: string }).nameEn || "";
    const ar = group.labelAr || (group as unknown as { nameAr?: string }).nameAr || "";
    return language === "ar" ? ar || en : en || t("customField.details.fields.noGroup");
  })();

  // Parse bilingual options list for Select and MultiSelect fields
  const optionsList = useMemo(() => {
    if (!field || (!field.options && !field.optionsAr)) return [];
    return parseBilingualOptions(field.options ?? "", field.optionsAr ?? "");
  }, [field]);

  // Value type presentation metadata
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

  // Validator presentation metadata
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

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString(resolveIntlLocale(language));
  };

  const hasOptions = valueTypeMeta?.hasOptions ?? false;
  const hasPlaceholder = valueTypeMeta?.hasPlaceholder ?? true;
  const isReferenceType = field?.valueType === "EntityReference";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 pe-4">
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <FileCode className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span>{field?.labelEn || fieldLabel || t("customField.details.title")}</span>
                {field?.labelAr && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({field.labelAr})
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t("customField.details.subtitle", {
                  field: field?.key || field?.labelEn || fieldLabel || "",
                })}
              </DialogDescription>
            </div>
            {field && (
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <Badge variant={valueTypeMeta?.badgeVariant ?? "secondary"} className="font-medium">
                  {valueTypeDisplayName}
                </Badge>
                <Badge variant={field.isActive ? "active" : "inactive"}>
                  {field.isActive
                    ? t("customField.details.fields.active")
                    : t("customField.details.fields.inactive")}
                </Badge>
              </div>
            )}
          </div>

          {/* Quick status summary pills */}
          {field && (
            <div className="mt-3 flex flex-wrap items-center gap-2 pt-1 text-xs">
              <Badge variant={field.isRequired ? "info" : "secondary"}>
                {field.isRequired ? t("customField.required") : t("customField.optional")}
              </Badge>
              <Badge variant="outline" className="gap-1">
                {field.isGlobal ? (
                  <>
                    <Globe className="h-3 w-3 text-sky-500" />
                    <span>{t("customField.details.fields.globalScope")}</span>
                  </>
                ) : (
                  <>
                    <Building2 className="h-3 w-3 text-indigo-500" />
                    <span>{t("customField.details.fields.tenantScope")}</span>
                  </>
                )}
              </Badge>
              <Badge variant={sensitivityBadgeVariant}>
                <Shield className="me-1 h-3 w-3" />
                {sensitivityDisplayName}
              </Badge>
            </div>
          )}
        </DialogHeader>

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
              {/* SECTION 1: General Information */}
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("customField.details.sections.general")}
                </h3>
                <div className="space-y-2.5 rounded-lg border bg-card p-3.5">
                  <DetailRow
                    label={t("customField.details.fields.key")}
                    value={field.key}
                    mono
                    copyable={field.key}
                  />
                  <Separator />
                  <DetailRow
                    label={t("customField.details.fields.entityType")}
                    value={
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entityTypeDisplayName}</span>
                        <code className="font-mono text-xs text-muted-foreground">
                          ({field.entityTypeKey})
                        </code>
                      </div>
                    }
                  />
                  <Separator />
                  <DetailRow
                    label={t("customField.details.fields.scope")}
                    value={
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="gap-1 font-medium">
                            {field.isGlobal ? (
                              <>
                                <Globe className="h-3 w-3 text-sky-500" />
                                <span>{t("customField.details.fields.globalScope")}</span>
                              </>
                            ) : (
                              <>
                                <Building2 className="h-3 w-3 text-indigo-500" />
                                <span>{t("customField.details.fields.tenantScope")}</span>
                              </>
                            )}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {field.isGlobal
                            ? t("customField.details.fields.scopeDescriptionGlobal")
                            : t("customField.details.fields.scopeDescriptionTenant")}
                        </span>
                      </div>
                    }
                  />
                  <Separator />
                  <DetailRow
                    label={t("customField.details.fields.labelEn")}
                    value={
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{field.labelEn}</span>
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                          EN
                        </Badge>
                      </div>
                    }
                  />
                  <Separator />
                  <DetailRow
                    label={t("customField.details.fields.labelAr")}
                    value={
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium" dir="rtl">
                          {field.labelAr || "—"}
                        </span>
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                          AR
                        </Badge>
                      </div>
                    }
                  />
                  <Separator />
                  <DetailRow
                    label={t("customField.details.fields.fieldGroup")}
                    value={fieldGroupName}
                  />
                  <Separator />
                  <DetailRow
                    label={t("customField.details.fields.sortOrder")}
                    value={String(field.sortOrder)}
                  />
                </div>
              </section>

              {/* SECTION 2: Value Type & Validation */}
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("customField.details.sections.valueConfig")}
                </h3>
                <div className="space-y-2.5 rounded-lg border bg-card p-3.5">
                  <DetailRow
                    label={t("customField.details.fields.valueType")}
                    value={
                      <Badge variant={valueTypeMeta?.badgeVariant ?? "secondary"}>
                        {valueTypeDisplayName}
                      </Badge>
                    }
                  />
                  <Separator />
                  <DetailRow
                    label={t("customField.details.fields.isRequired")}
                    value={
                      <div className="flex items-center gap-1.5">
                        {field.isRequired ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>{t("customField.required")}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                            <span>{t("customField.optional")}</span>
                          </>
                        )}
                      </div>
                    }
                  />
                  {hasPlaceholder && (
                    <>
                      <Separator />
                      <DetailRow
                        label={t("customField.details.fields.placeholderEn")}
                        value={
                          <div className="flex items-center justify-between gap-2">
                            <span>{field.placeholderEn || "—"}</span>
                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                              EN
                            </Badge>
                          </div>
                        }
                      />
                      <Separator />
                      <DetailRow
                        label={t("customField.details.fields.placeholderAr")}
                        value={
                          <div className="flex items-center justify-between gap-2">
                            <span dir="rtl">{field.placeholderAr || "—"}</span>
                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                              AR
                            </Badge>
                          </div>
                        }
                      />
                    </>
                  )}
                  {isReferenceType && (
                    <>
                      <Separator />
                      <DetailRow
                        label={t("customField.details.fields.referenceTarget")}
                        value={referenceTargetDisplayName}
                      />
                    </>
                  )}
                  {field.valueType === "Text" && (
                    <>
                      <Separator />
                      <DetailRow
                        label={t("customField.details.fields.validatorKind")}
                        value={validatorDisplayName}
                      />
                      {field.validatorParam && (
                        <>
                          <Separator />
                          <DetailRow
                            label={t("customField.details.fields.validatorParam")}
                            value={field.validatorParam}
                            mono
                          />
                        </>
                      )}
                    </>
                  )}
                </div>
              </section>

              {/* SECTION 3: Options (Select / MultiSelect) */}
              {hasOptions && (
                <section className="space-y-3">
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("customField.details.sections.options", {
                      count: optionsList.length,
                    })}
                  </h3>
                  {optionsList.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                      {t("customField.details.optionsTable.empty")}
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-12 text-center">
                              {t("customField.details.optionsTable.index")}
                            </TableHead>
                            <TableHead>{t("customField.details.optionsTable.labelEn")}</TableHead>
                            <TableHead>{t("customField.details.optionsTable.labelAr")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {optionsList.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                {idx + 1}
                              </TableCell>
                              <TableCell className="text-sm font-medium">{row.en || "—"}</TableCell>
                              <TableCell className="text-sm">
                                {row.ar || <span className="text-muted-foreground">—</span>}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </section>
              )}

              {/* SECTION 4: Data Governance & Sensitivity */}
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("customField.details.sections.governance")}
                </h3>
                <div className="space-y-2.5 rounded-lg border bg-card p-3.5">
                  <DetailRow
                    label={t("customField.details.fields.sensitivity")}
                    value={
                      <div className="flex items-center gap-2">
                        <Badge variant={sensitivityBadgeVariant}>{sensitivityDisplayName}</Badge>
                      </div>
                    }
                    hint={t("customField.hints.sensitivity")}
                  />
                  <Separator />
                  <DetailRow
                    label={t("customField.details.fields.isExportable")}
                    value={
                      <Badge variant={field.isExportable !== false ? "success" : "secondary"}>
                        {field.isExportable !== false
                          ? t("customField.details.fields.exportableYes")
                          : t("customField.details.fields.exportableNo")}
                      </Badge>
                    }
                    hint={t("customField.hints.isExportable")}
                  />
                </div>
              </section>

              {/* SECTION 5: Audit & Timestamps */}
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("customField.details.sections.audit")}
                </h3>
                <div className="space-y-2.5 rounded-lg border bg-card p-3.5 text-xs">
                  <DetailRow
                    label={t("customField.details.fields.createdAt")}
                    value={formatDate(field.createdAt)}
                  />
                  <Separator />
                  <DetailRow
                    label={t("customField.details.fields.modifiedAt")}
                    value={
                      field.modifiedAt
                        ? formatDate(field.modifiedAt)
                        : t("customField.details.fields.neverModified")
                    }
                  />
                </div>
              </section>
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
