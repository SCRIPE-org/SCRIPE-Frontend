"use client";

import React from "react";
import { Download, Info, Layers, ShieldCheck, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Card } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Props for EntitiesKpiHeader component.
 */
export interface EntitiesKpiHeaderProps {
  kpis: {
    total: number;
    importable: number;
    exportable: number;
    quotaConstrained: number;
  };
}

/**
 * Renders the 4-metric KPI summary strip and read-only provider/edition discovery notice
 * for the Data Exchange Entities catalog.
 */
export function EntitiesKpiHeader({ kpis }: EntitiesKpiHeaderProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <div className="space-y-3 mb-4">
      <Alert variant="info" className="py-2.5 px-3.5 text-xs">
        <Info className="h-4 w-4" aria-hidden="true" />
        <AlertDescription className="text-xs leading-relaxed">
          {t("dataTransferEntities.catalogInfo")}
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
            <Layers className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />
            <span>{t("dataTransferEntities.kpi.totalEntities")}</span>
          </div>
          <span className="text-xl font-bold text-nx-ink font-mono tabular-nums">{kpis.total}</span>
        </Card>
        <Card className="p-3.5">
          <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
            <Upload className="h-3.5 w-3.5 text-nx-info" aria-hidden="true" />
            <span>{t("dataTransferEntities.kpi.importable")}</span>
          </div>
          <span className="text-xl font-bold text-nx-ink font-mono tabular-nums">{kpis.importable}</span>
        </Card>
        <Card className="p-3.5">
          <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
            <Download className="h-3.5 w-3.5 text-nx-success" aria-hidden="true" />
            <span>{t("dataTransferEntities.kpi.exportable")}</span>
          </div>
          <span className="text-xl font-bold text-nx-ink font-mono tabular-nums">{kpis.exportable}</span>
        </Card>
        <Card className="p-3.5">
          <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-nx-warning" aria-hidden="true" />
            <span>{t("dataTransferEntities.kpi.quotaConstrained")}</span>
          </div>
          <span className="text-xl font-bold text-nx-ink font-mono tabular-nums">{kpis.quotaConstrained}</span>
        </Card>
      </div>
    </div>
  );
}
