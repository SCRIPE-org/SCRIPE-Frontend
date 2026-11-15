"use client";

import React from "react";
import { BookOpen, CheckCircle, Database, Layers } from "lucide-react";
import { Card } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Props for PresetsKpiHeader component.
 */
export interface PresetsKpiHeaderProps {
  kpis: {
    totalPresets: number;
    defaultPresets: number;
    entitiesCovered: number;
    totalMappings: number;
  };
}

/**
 * Renders the 4-metric KPI summary strip for saved mapping presets.
 */
export function PresetsKpiHeader({ kpis }: PresetsKpiHeaderProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <Card className="p-3.5">
        <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
          <BookOpen className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />
          <span>{t("adminDataTransferPresets.kpis.totalPresets")}</span>
        </div>
        <span className="text-xl font-bold text-nx-ink font-mono tabular-nums">
          {kpis.totalPresets}
        </span>
      </Card>
      <Card className="p-3.5">
        <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
          <CheckCircle className="h-3.5 w-3.5 text-nx-success" aria-hidden="true" />
          <span>{t("adminDataTransferPresets.kpis.defaultPresets")}</span>
        </div>
        <span className="text-xl font-bold text-nx-ink font-mono tabular-nums">
          {kpis.defaultPresets}
        </span>
      </Card>
      <Card className="p-3.5">
        <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
          <Database className="h-3.5 w-3.5 text-nx-info" aria-hidden="true" />
          <span>{t("adminDataTransferPresets.kpis.entitiesCovered")}</span>
        </div>
        <span className="text-xl font-bold text-nx-ink font-mono tabular-nums">
          {kpis.entitiesCovered}
        </span>
      </Card>
      <Card className="p-3.5">
        <div className="flex items-center gap-2 text-nx-ink-3 text-xs mb-1">
          <Layers className="h-3.5 w-3.5 text-nx-warning" aria-hidden="true" />
          <span>{t("adminDataTransferPresets.kpis.totalMappings")}</span>
        </div>
        <span className="text-xl font-bold text-nx-ink font-mono tabular-nums">
          {kpis.totalMappings}
        </span>
      </Card>
    </div>
  );
}
