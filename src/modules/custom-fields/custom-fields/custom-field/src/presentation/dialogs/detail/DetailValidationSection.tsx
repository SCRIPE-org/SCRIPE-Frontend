import React from "react";
import { CheckCircle2, SlidersHorizontal, XCircle } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { DetailRow } from "@core/ui/detail-row";
import { Separator } from "@core/ui/separator";
import { useI18n } from "@core/providers/i18n-provider";
import type { CustomField } from "../../../domain/entities/CustomField";
import type { VALUE_TYPE_CATALOG } from "../../registries/valueTypeRegistry";

/**
 * Documentation for module export
 */
export interface DetailValidationSectionProps {
  field: CustomField;
  valueTypeDisplayName: string;
  valueTypeMeta: (typeof VALUE_TYPE_CATALOG)[keyof typeof VALUE_TYPE_CATALOG] | null;
  hasPlaceholder: boolean;
  isReferenceType: boolean;
  referenceTargetDisplayName: string;
  validatorDisplayName: string;
}

/**
 * Documentation for DetailValidationSection
 */
export function DetailValidationSection({
  field,
  valueTypeDisplayName,
  valueTypeMeta,
  hasPlaceholder,
  isReferenceType,
  referenceTargetDisplayName,
  validatorDisplayName,
}: DetailValidationSectionProps): React.ReactElement {
  const { t } = useI18n();

  return (
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
  );
}
