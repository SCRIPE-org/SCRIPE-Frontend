"use client";

import type React from "react";
import { Card } from "@core/ui/card";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";
import { OpportunityStatusBadge } from "./OpportunityStatusBadge";
import { OpportunityStageBadge } from "./OpportunityStageBadge";

/** Renders the SplitPane detail preview for CrmOpportunity in GenericCrudView. */
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
            {opp.partyId || opp.accountId
              ? opp.accountDisplayName ||
                opp.partyDisplayName ||
                opp.primaryContactName ||
                t("crmOpportunities.kanban.partyVerified")
              : t("crmOpportunities.kanban.partyUnlinked")}
          </div>
        </div>
        {opp.ownerDisplayName && (
          <div className="space-y-1 col-span-2">
            <span className="text-nx-ink-3">{t("crmOpportunities.table.owner")}</span>
            <div className="font-medium text-nx-ink">{opp.ownerDisplayName}</div>
          </div>
        )}
      </div>
      <div className="border-t border-nx-line pt-3 flex justify-end">{actions}</div>
    </Card>
  );
}
