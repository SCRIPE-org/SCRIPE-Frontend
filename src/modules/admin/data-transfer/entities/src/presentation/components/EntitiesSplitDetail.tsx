"use client";

import React from "react";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type { DataExchangeEntity } from "../../domain/entities/DataExchangeEntity";

export interface EntitiesSplitListItemProps {
  entity: DataExchangeEntity;
}

/**
 * Compact SplitPane left-column item rendering entity title, module, and quota state.
 */
export function EntitiesSplitListItem({
  entity,
}: EntitiesSplitListItemProps): React.ReactElement {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const displayName =
    isAr && entity.displayNameAr ? entity.displayNameAr : entity.displayNameEn;
  const isExhausted =
    typeof entity.remainingQuotaSlots === "number" && entity.remainingQuotaSlots <= 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-nx-ink">{displayName}</p>
          <p dir="ltr" className="truncate font-mono text-[11px] text-nx-ink-3 w-fit">
            {entity.entityKey}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 text-[10px] font-medium uppercase">
          {entity.owningModule}
        </Badge>
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-nx-ink-3">
        <span>
          {entity.canImport && entity.canExport
            ? t("dataTransferEntities.capabilities.importAndExport")
            : entity.canImport
              ? t("dataTransferEntities.capabilities.importOnly")
              : t("dataTransferEntities.capabilities.exportOnly")}
        </span>
        {typeof entity.remainingQuotaSlots === "number" ? (
          <Badge
            variant={isExhausted ? "danger" : "info"}
            className="text-[10px] font-mono tabular-nums px-1.5 py-0"
          >
            {isExhausted
              ? t("dataTransferEntities.quota.exhausted")
              : `${entity.remainingQuotaSlots}/${entity.quotaMaxLimit ?? "∞"}`}
          </Badge>
        ) : (
          <span>{t("dataTransferEntities.quota.unlimited")}</span>
        )}
      </div>
    </div>
  );
}

export interface EntitiesSplitDetailProps {
  entity: DataExchangeEntity;
  actions: React.ReactNode;
}

/**
 * SplitPane right-hand schema & quota inspector for a selected DataExchangeEntity.
 */
export function EntitiesSplitDetail({
  entity,
  actions,
}: EntitiesSplitDetailProps): React.ReactElement {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const displayName =
    isAr && entity.displayNameAr ? entity.displayNameAr : entity.displayNameEn;
  const description =
    isAr && entity.descriptionAr ? entity.descriptionAr : entity.descriptionEn;
  const isExhausted =
    typeof entity.remainingQuotaSlots === "number" && entity.remainingQuotaSlots <= 0;

  return (
    <div className="space-y-4" data-testid="entities-split-detail">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-nx-line pb-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-medium uppercase">
              {entity.owningModule}
            </Badge>
            <Badge variant={isExhausted ? "danger" : "info"} className="text-[10px] font-mono tabular-nums">
              {typeof entity.remainingQuotaSlots !== "number"
                ? t("dataTransferEntities.quota.unlimited")
                : isExhausted
                  ? t("dataTransferEntities.quota.exhausted")
                  : t("dataTransferEntities.quota.slotsRemaining", {
                      remaining: entity.remainingQuotaSlots,
                      limit: entity.quotaMaxLimit ?? "∞",
                    })}
            </Badge>
          </div>
          <h3 className="text-base font-semibold text-nx-ink">{displayName}</h3>
          <code
            dir="ltr"
            className="inline-block rounded-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 font-mono text-[11px] text-nx-ink-2"
          >
            {entity.entityKey}
          </code>
          {description && <p className="text-xs text-nx-ink-2 leading-relaxed">{description}</p>}
        </div>
        <div className="shrink-0">{actions}</div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("dataTransferEntities.columns.supportedModes")}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {entity.supportedModes.map((mode) => (
              <Badge key={mode} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                {t(`dataTransferEntities.modes.${mode}`, { defaultValue: mode })}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("dataTransferEntities.detail.importEntitlement")}</p>
          <p className="mt-1 font-medium text-nx-ink">
            {entity.isImportFeatureEnabled ? t("common.enabled") : t("common.disabled")}
          </p>
        </div>

        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("dataTransferEntities.detail.exportEntitlement")}</p>
          <p className="mt-1 font-medium text-nx-ink">
            {entity.isExportFeatureEnabled ? t("common.enabled") : t("common.disabled")}
          </p>
        </div>

        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("dataTransferEntities.detail.autoCreateLookups")}</p>
          <p className="mt-1 font-medium text-nx-ink">
            {entity.supportsBulkAutoCreateLookup ? t("common.yes") : t("common.no")}
          </p>
        </div>

        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("dataTransferEntities.detail.identityOnboarding")}</p>
          <p className="mt-1 font-medium text-nx-ink">
            {entity.supportsIdentityOnboardingModes ? t("common.yes") : t("common.no")}
          </p>
        </div>

        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("dataTransferEntities.detail.parentEntities")}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {entity.parentEntityKeys.length > 0 ? (
              entity.parentEntityKeys.map((key) => (
                <code
                  key={key}
                  dir="ltr"
                  className="rounded-sm border border-nx-line bg-nx-surface px-1.5 py-0.5 font-mono text-[10px] text-nx-ink-2"
                >
                  {key}
                </code>
              ))
            ) : (
              <span className="text-nx-ink-3">{t("common.none")}</span>
            )}
          </div>
        </div>
      </div>

      {entity.relatedMultiSheetEntityKeys.length > 0 && (
        <div className="rounded-nx-control border border-nx-line bg-nx-raised/40 p-3 text-xs">
          <p className="text-nx-ink-3">{t("dataTransferEntities.detail.multiSheetGroup")}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {entity.relatedMultiSheetEntityKeys.map((key) => (
              <code
                key={key}
                dir="ltr"
                className="rounded-sm border border-nx-line bg-nx-surface px-1.5 py-0.5 font-mono text-[10px] text-nx-ink-2"
              >
                {key}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
