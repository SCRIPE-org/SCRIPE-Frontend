import React from "react";
import { Building2, Globe, Tag } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { DetailRow } from "@core/ui/detail-row";
import { Separator } from "@core/ui/separator";
import { useI18n } from "@core/providers/i18n-provider";
import type { CustomField } from "../../../domain/entities/CustomField";

export interface DetailGeneralSectionProps {
  field: CustomField;
  entityTypeDisplayName: string;
  fieldGroupName: string;
}

export function DetailGeneralSection({
  field,
  entityTypeDisplayName,
  fieldGroupName,
}: DetailGeneralSectionProps): React.ReactElement {
  const { t } = useI18n();

  return (
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
  );
}
