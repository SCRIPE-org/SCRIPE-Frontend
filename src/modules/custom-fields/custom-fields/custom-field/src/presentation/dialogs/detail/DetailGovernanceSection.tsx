import React from "react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { DetailRow } from "@core/ui/detail-row";
import { Separator } from "@core/ui/separator";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Documentation for module export
 */
export interface DetailGovernanceSectionProps {
  sensitivityBadgeVariant: "outline" | "secondary" | "warning" | "destructive";
  sensitivityDisplayName: string;
  isExportable?: boolean | null;
}

/**
 * Documentation for DetailGovernanceSection
 */
export function DetailGovernanceSection({
  sensitivityBadgeVariant,
  sensitivityDisplayName,
  isExportable,
}: DetailGovernanceSectionProps): React.ReactElement {
  const { t } = useI18n();

  return (
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
            <Badge variant={isExportable !== false ? "success" : "secondary"}>
              {isExportable !== false
                ? t("customField.details.fields.exportableYes")
                : t("customField.details.fields.exportableNo")}
            </Badge>
          }
          hint={t("customField.hints.isExportable")}
        />
      </div>
    </section>
  );
}
