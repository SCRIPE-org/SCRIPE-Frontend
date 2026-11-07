"use client";

import type React from "react";
import { ShieldCheck, ShieldAlert, Calendar } from "lucide-react";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import type { CrudColumn } from "@core/crud/components/generic-crud-view";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";
import { OpportunityStatusBadge } from "./OpportunityStatusBadge";
import { OpportunityStageBadge } from "./OpportunityStageBadge";

/**
 * Builds GenericCrudView columns for CrmOpportunity records.
 */
export function buildOpportunityColumns(
  t: (key: string, params?: Record<string, string | number>) => string,
  language: string,
  onSelectOpportunity: (opp: CrmOpportunity) => void
): CrudColumn<CrmOpportunity>[] {
  return [
    {
      key: "title",
      label: t("crmOpportunities.table.title"),
      sortable: true,
      render: (_val, opp: CrmOpportunity) => (
        <div className="max-w-[230px] overflow-hidden">
          <Button
            type="button"
            variant="link"
            onClick={() => onSelectOpportunity(opp)}
            title={opp.title}
            className="p-0 h-auto max-w-full font-semibold text-nx-ink hover:text-nx-accent transition-colors truncate block text-start"
          >
            {opp.title}
          </Button>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-nx-ink-3 font-medium">
              {t(`crmOpportunities.dealKind.${opp.dealKind}`, {
                defaultValue: opp.dealKind === "NewBusiness" ? "New Business" : opp.dealKind,
              })}
            </span>
            {opp.directCreateRationale && (
              <span
                className="text-[11px] text-nx-ink-3 truncate max-w-[110px]"
                title={opp.directCreateRationale}
              >
                • {opp.directCreateRationale}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "stageKey",
      label: t("crmOpportunities.table.stage"),
      sortable: true,
      render: (_val, opp: CrmOpportunity) => (
        <OpportunityStageBadge
          stageKey={opp.stageKey}
          label={
            language === "ar" && opp.stageLabelArSnapshot
              ? opp.stageLabelArSnapshot
              : opp.stageLabelEnSnapshot
          }
        />
      ),
    },
    {
      key: "status",
      label: t("crmOpportunities.table.status"),
      sortable: true,
      render: (_val, opp: CrmOpportunity) => <OpportunityStatusBadge status={opp.status} />,
    },
    {
      key: "estimatedAmount",
      label: t("crmOpportunities.table.amount"),
      sortable: true,
      render: (_val, opp: CrmOpportunity) => (
        <span className="font-bold text-nx-ink whitespace-nowrap">
          {opp.maskedFieldKeys?.includes("estimatedAmount")
            ? "••••••"
            : opp.estimatedAmount != null
            ? `${opp.currencyCode} ${Number(opp.estimatedAmount).toLocaleString()}`
            : "—"}
        </span>
      ),
    },
    {
      key: "partyId",
      label: t("crmOpportunities.table.party"),
      render: (_val, opp: CrmOpportunity) =>
        opp.partyId ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-success font-medium whitespace-nowrap">
            <ShieldCheck className="size-3.5" />
            {t("crmOpportunities.kanban.partyVerified", { defaultValue: "Linked" })}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-nx-ink-3 whitespace-nowrap">
            <ShieldAlert className="size-3.5 text-warning" />
            {t("crmOpportunities.kanban.partyUnlinked", { defaultValue: "Unlinked" })}
          </span>
        ),
    },
    {
      key: "targetCloseDate",
      label: t("crmOpportunities.table.targetClose"),
      sortable: true,
      render: (_val, opp: CrmOpportunity) => {
        const formattedTargetClose = opp.targetCloseDate
          ? new Date(opp.targetCloseDate).toLocaleDateString(
              language === "ar" ? "ar-SA" : "en-US",
              { month: "short", day: "numeric", year: "numeric" }
            )
          : "—";
        return <span className="text-nx-ink-2 whitespace-nowrap">{formattedTargetClose}</span>;
      },
    },
    {
      key: "createdAt",
      label: t("crmOpportunities.table.createdAt"),
      sortable: true,
      render: (_val, opp: CrmOpportunity) => {
        const formattedDate = opp.createdAt
          ? new Date(opp.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—";
        return (
          <span className="inline-flex items-center gap-1 text-nx-ink-3 whitespace-nowrap">
            <Calendar className="size-2.5" />
            {formattedDate}
          </span>
        );
      },
    },
  ];
}

/**
 * Renders a CardGrid item for CrmOpportunity in GenericCrudView.
 */
export function renderOpportunityCardGridItem(
  opp: CrmOpportunity,
  actions: React.ReactNode,
  language: string,
  onSelectOpportunity: (opp: CrmOpportunity) => void
) {
  return (
    <Card className="flex flex-col justify-between gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi transition-all">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2 overflow-hidden">
          <Button
            type="button"
            variant="link"
            onClick={() => onSelectOpportunity(opp)}
            title={opp.title}
            className="p-0 h-auto max-w-full font-bold text-sm text-nx-ink hover:text-nx-accent truncate block text-start"
          >
            {opp.title}
          </Button>
          <OpportunityStatusBadge status={opp.status} />
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <OpportunityStageBadge
            stageKey={opp.stageKey}
            label={
              language === "ar" && opp.stageLabelArSnapshot
                ? opp.stageLabelArSnapshot
                : opp.stageLabelEnSnapshot
            }
          />
          <span className="font-bold text-nx-accent">
            {opp.maskedFieldKeys?.includes("estimatedAmount")
              ? "••••••"
              : opp.estimatedAmount != null
              ? `${opp.currencyCode} ${Number(opp.estimatedAmount).toLocaleString()}`
              : "—"}
          </span>
        </div>
      </div>
      <div className="border-t border-nx-line pt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-nx-ink-3 font-medium">
          {opp.dealKind === "NewBusiness" ? "New Business" : opp.dealKind}
        </span>
        {actions}
      </div>
    </Card>
  );
}

/**
 * Renders the SplitPane detail view for CrmOpportunity in GenericCrudView.
 */
export function renderOpportunitySplitDetail(
  opp: CrmOpportunity,
  actions: React.ReactNode,
  language: string,
  t: (key: string, params?: Record<string, string | number>) => string
) {
  return (
    <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4">
      <div className="flex items-start justify-between border-b border-nx-line pb-4 gap-3">
        <div>
          <h3 className="text-base font-bold text-nx-ink">{opp.title}</h3>
          <p className="text-xs text-nx-ink-3 font-medium mt-1">
            {t(`crmOpportunities.dealKind.${opp.dealKind}`, {
              defaultValue: opp.dealKind === "NewBusiness" ? "New Business" : opp.dealKind,
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <OpportunityStageBadge
            stageKey={opp.stageKey}
            label={
              language === "ar" && opp.stageLabelArSnapshot
                ? opp.stageLabelArSnapshot
                : opp.stageLabelEnSnapshot
            }
          />
          <OpportunityStatusBadge status={opp.status} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-nx-ink-3">{t("crmOpportunities.table.amount")}</span>
          <div className="font-bold text-nx-accent text-sm">
            {opp.maskedFieldKeys?.includes("estimatedAmount")
              ? "••••••"
              : opp.estimatedAmount != null
              ? `${opp.currencyCode} ${Number(opp.estimatedAmount).toLocaleString()}`
              : "—"}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-nx-ink-3">{t("crmOpportunities.table.party")}</span>
          <div className="font-medium text-nx-ink">
            {opp.partyId
              ? t("crmOpportunities.kanban.partyVerified", { defaultValue: "Linked" })
              : t("crmOpportunities.kanban.partyUnlinked", { defaultValue: "Unlinked" })}
          </div>
        </div>
      </div>
      <div className="border-t border-nx-line pt-3 flex justify-end">{actions}</div>
    </Card>
  );
}
