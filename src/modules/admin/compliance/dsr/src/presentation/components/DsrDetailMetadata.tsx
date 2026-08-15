"use client";

import { Card, CardContent } from "@core/ui/card";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { formatDateUtc } from "@core/common/utils";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

interface DsrDetailMetadataProps {
  dsr: DataSubjectRequest;
  t: (key: string) => string;
  statusMeta: {
    labelKey: string;
    icon: React.ComponentType<{
      className?: string;
      "aria-hidden"?: React.AriaAttributes["aria-hidden"];
    }>;
    variant: BadgeProps["variant"];
  };
  typeMeta: { labelKey: string; color: string };
}

/**
 * Presentation UI component rendering the dsr detail metadata.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DsrDetailMetadata({ dsr, t, statusMeta, typeMeta }: DsrDetailMetadataProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card>
        <CardContent className="flex flex-col justify-center p-4">
          <p className="mb-1 text-xs text-nx-ink-3">{t("compliance.columns.requestType")}</p>
          <div className={`font-medium ${typeMeta.color}`}>{t(typeMeta.labelKey)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col justify-center p-4">
          <p className="mb-1 text-xs text-nx-ink-3">{t("compliance.columns.status")}</p>
          <Badge variant={statusMeta.variant} className="w-fit gap-1 px-2">
            <statusMeta.icon className="h-3.5 w-3.5" aria-hidden="true" />
            {t(statusMeta.labelKey)}
          </Badge>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col justify-center p-4">
          <p className="mb-1 text-xs text-nx-ink-3">{t("compliance.columns.deadline")}</p>
          <p className="text-sm font-medium tabular-nums text-nx-ink">
            {formatDateUtc(dsr.deadline)}
            {dsr.daysRemaining > 0 && (
              <span className="ms-2 text-xs text-nx-ink-3">
                ({dsr.daysRemaining} {t("compliance.remaining")})
              </span>
            )}
            {dsr.isOverdue && (
              <span className="ms-2 text-xs text-destructive">({t("compliance.overdue")})</span>
            )}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col justify-center p-4">
          <p className="mb-1 text-xs text-nx-ink-3">{t("compliance.columns.regulation")}</p>
          <p className="font-mono text-sm font-medium text-nx-ink">{dsr.regulationCode}</p>
        </CardContent>
      </Card>
    </div>
  );
}
