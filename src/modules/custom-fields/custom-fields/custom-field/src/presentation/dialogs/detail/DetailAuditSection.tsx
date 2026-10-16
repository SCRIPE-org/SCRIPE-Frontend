import React from "react";
import { Clock } from "lucide-react";
import { DetailRow } from "@core/ui/detail-row";
import { Separator } from "@core/ui/separator";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Documentation for module export
 */
export interface DetailAuditSectionProps {
  createdAt?: string | null;
  modifiedAt?: string | null;
  formatDate: (iso?: string | null) => string;
}

/**
 * Documentation for DetailAuditSection
 */
export function DetailAuditSection({
  createdAt,
  modifiedAt,
  formatDate,
}: DetailAuditSectionProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        {t("customField.details.sections.audit")}
      </h3>
      <div className="space-y-2.5 rounded-lg border bg-card p-3.5 text-xs">
        <DetailRow
          label={t("customField.details.fields.createdAt")}
          value={formatDate(createdAt)}
        />
        <Separator />
        <DetailRow
          label={t("customField.details.fields.modifiedAt")}
          value={
            modifiedAt ? formatDate(modifiedAt) : t("customField.details.fields.neverModified")
          }
        />
      </div>
    </section>
  );
}
