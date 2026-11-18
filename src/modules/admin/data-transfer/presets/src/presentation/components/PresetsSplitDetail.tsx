"use client";

import React from "react";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";

export interface PresetsSplitListItemProps {
  preset: DataExchangePreset;
  entityDisplayName: string;
}

/**
 * Compact SplitPane left-column item rendering preset name, entity, and mapping count.
 */
export function PresetsSplitListItem({
  preset,
  entityDisplayName,
}: PresetsSplitListItemProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-nx-ink">{preset.name}</p>
          <p className="truncate text-xs text-nx-ink-3">{entityDisplayName}</p>
        </div>
        {preset.isDefault && (
          <Badge variant="success" className="shrink-0 text-[10px] px-1.5 py-0">
            {t("adminDataTransferPresets.status.isDefaultBadge")}
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-nx-ink-3">
        <span>
          {t(`adminDataTransferPresets.modes.${preset.importMode}`, {
            defaultValue: preset.importMode,
          })}
        </span>
        <span className="font-mono tabular-nums text-nx-ink-2">
          {t("adminDataTransferPresets.columnsCount", { count: String(preset.mappingCount) })}
        </span>
      </div>
    </div>
  );
}

export interface PresetsSplitDetailProps {
  preset: DataExchangePreset;
  entityDisplayName: string;
  actions: React.ReactNode;
}

/**
 * SplitPane right-hand inspector displaying preset configuration and saved field mappings.
 */
export function PresetsSplitDetail({
  preset,
  entityDisplayName,
  actions,
}: PresetsSplitDetailProps): React.ReactElement {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const dateLocale = isAr ? "ar-EG" : "en-US";
  const createdDate = new Date(preset.createdAt);

  return (
    <div className="space-y-4" data-testid="presets-split-detail">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-nx-line pb-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {preset.isDefault ? (
              <Badge variant="success" className="text-[10px] px-1.5 py-0.5">
                {t("adminDataTransferPresets.status.isDefaultBadge")}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                {t("adminDataTransferPresets.status.customBadge")}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] font-medium">
              {t(`adminDataTransferPresets.modes.${preset.importMode}`, {
                defaultValue: preset.importMode,
              })}
            </Badge>
          </div>
          <h3 className="text-base font-semibold text-nx-ink">{preset.name}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-nx-ink-2">
            <span>{entityDisplayName}</span>
            <code
              dir="ltr"
              className="rounded-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 font-mono text-[11px] text-nx-ink-3"
            >
              {preset.entityKey}
            </code>
          </div>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-nx-control border border-nx-line bg-nx-raised p-3 text-xs">
          <p className="text-nx-ink-3">{t("adminDataTransferPresets.columns.mappingsCount")}</p>
          <p className="mt-1 font-mono text-sm font-semibold text-nx-ink tabular-nums">
            {t("adminDataTransferPresets.columnsCount", { count: String(preset.mappingCount) })}
          </p>
        </div>

        <div className="rounded-nx-control border border-nx-line bg-nx-raised p-3 text-xs">
          <p className="text-nx-ink-3">{t("adminDataTransferPresets.columns.createdAt")}</p>
          <p className="mt-1 font-mono text-xs font-medium text-nx-ink tabular-nums">
            {createdDate.toLocaleDateString(dateLocale)}{" "}
            {createdDate.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      <div className="rounded-nx-control border border-nx-line bg-nx-raised p-3 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-medium text-nx-ink-3">
          <span>{t("adminDataTransferPresets.detail.sourceColumn")}</span>
          <span>{t("adminDataTransferPresets.detail.targetField")}</span>
        </div>
        {preset.mappings.length === 0 ? (
          <p className="text-nx-ink-3 py-1">{t("common.none")}</p>
        ) : (
          <div className="divide-y divide-nx-line">
            {preset.mappings.map((mapping, idx) => (
              <div
                key={`${mapping.sourceColumnHeader}-${mapping.targetFieldKey}-${idx}`}
                className="flex items-center justify-between gap-2 py-1.5"
              >
                <code className="font-mono text-[11px] text-nx-ink truncate">
                  {mapping.sourceColumnHeader}
                </code>
                <code dir="ltr" className="font-mono text-[11px] text-nx-accent shrink-0">
                  {mapping.targetFieldKey}
                </code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
