"use client";

import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Lock, ShieldCheck, ShieldAlert } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { OpportunityStatusBadge } from "./OpportunityStatusBadge";
import { OpportunityStageBadge } from "./OpportunityStageBadge";
import { useCrmCurrency, useCrmWorkflowsStore } from "@modules/crm";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";

/**
 * Properties for OpportunityOverviewCard.
 */
export interface OpportunityOverviewCardProps {
  opp: CrmOpportunity;
}

/**
 * Header card presenting primary opportunity metrics, financial value, and verification status.
 */
export function OpportunityOverviewCard({ opp }: OpportunityOverviewCardProps) {
  const { t, language } = useI18n();
  const isOpen = opp.status === "Open";
  const { baseCurrency, autoConvertToBase, convertAmount, getRate } = useCrmCurrency();
  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));
  const activeStage = activeDealWorkflow?.stages.find((s) => s.stageKey === opp.stageKey);
  const rawLockedFields =
    (activeStage as { properties?: Record<string, string> })?.properties?.lockedFields ??
    (opp.stageKey.includes("negotiation") || opp.status === "Won" ? "estimatedAmount,currencyCode" : "");
  const lockedFields = rawLockedFields ? rawLockedFields.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const isAmountLocked = lockedFields.includes("estimatedAmount") || lockedFields.includes("currencyCode");
  const isMasked = opp.maskedFieldKeys?.includes("estimatedAmount");
  const nativeCurr = (opp.currencyCode || "SAR").toUpperCase();
  const isForeignCurr =
    !isMasked &&
    autoConvertToBase &&
    opp.estimatedAmount != null &&
    nativeCurr !== baseCurrency.toUpperCase();

  const formatDealKind = (kind?: string) => {
    if (!kind) return "—";
    if (kind === "NewBusiness") return t("crmOpportunities.dealKind.NewBusiness", { defaultValue: "New Business" });
    if (kind === "Expansion") return t("crmOpportunities.dealKind.Expansion", { defaultValue: "Expansion" });
    if (kind === "Renewal") return t("crmOpportunities.dealKind.Renewal", { defaultValue: "Renewal" });
    if (kind === "Services") return t("crmOpportunities.dealKind.Services", { defaultValue: "Services" });
    return kind.replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  return (
    <Card className="p-6 border-nx-line bg-nx-surface">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-nx-ink">{opp.title}</h1>
            <OpportunityStatusBadge status={opp.status} />
          </div>
          <p className="text-xs text-nx-ink-3">
            {formatDealKind(opp.dealKind)} • {opp.currencyCode}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-end">
            <span className="text-xs text-nx-ink-3 flex items-center justify-end gap-1">
              {t("crmOpportunities.detail.estimatedAmount")}
              {isAmountLocked && (
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 gap-0.5 text-nx-warning-strong border-warning-strong/40 bg-warning/10" data-testid="opp-overview-amount-locked-badge">
                  <Lock className="size-2.5" />
                  {t("crmOpportunities.ruleConfig.lockedReadOnlyBadge")}
                </Badge>
              )}
            </span>
            <span className="text-xl font-bold text-nx-ink">
              {isMasked
                ? "••••••"
                : opp.estimatedAmount != null
                ? `${opp.currencyCode} ${Number(opp.estimatedAmount).toLocaleString()}`
                : "—"}
            </span>
            {isForeignCurr && (
              <span
                data-testid="opp-detail-converted-amount"
                className="block text-xs font-mono text-nx-accent mt-0.5"
              >
                ≈ {baseCurrency}{" "}
                {Math.round(
                  convertAmount(Number(opp.estimatedAmount), nativeCurr, baseCurrency)
                ).toLocaleString()}{" "}
                (1 {nativeCurr} = {getRate(nativeCurr, baseCurrency).toFixed(4)} {baseCurrency})
              </span>
            )}
          </div>
          <div className="border-s border-nx-line ps-4">
            <span className="text-xs text-nx-ink-3 block">
              {t("crmOpportunities.detail.stage")}
            </span>
            <OpportunityStageBadge
              stageKey={opp.stageKey}
              label={
                language === "ar" && opp.stageLabelArSnapshot
                  ? opp.stageLabelArSnapshot
                  : opp.stageLabelEnSnapshot
              }
              className="mt-0.5"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-nx-line text-xs">
        <div>
          <span className="text-nx-ink-3 block">{t("crmOpportunities.detail.dealType")}</span>
          <span className="font-semibold text-nx-ink">{formatDealKind(opp.dealKind)}</span>
        </div>
        <div>
          <span className="text-nx-ink-3 block">
            {t("crmOpportunities.detail.accountVerification")}
          </span>
          {opp.partyId ? (
            <span className="font-medium text-success flex items-center gap-1">
              <ShieldCheck className="size-3.5" />{" "}
              {t("crmOpportunities.detail.verifiedAccountLinked", { defaultValue: "Verified Account / Contact Linked" })}
            </span>
          ) : (
            <span className="font-medium text-nx-warning-strong flex items-center gap-1">
              <ShieldAlert className="size-3.5" />{" "}
              {t("crmOpportunities.detail.unlinkedPreProposal", { defaultValue: "Unlinked (Pre-Proposal)" })}
            </span>
          )}
        </div>
        <div>
          <span className="text-nx-ink-3 block">
            {t("crmOpportunities.detail.targetCloseDate")}
          </span>
          <span className="font-medium text-nx-ink">
            {opp.targetCloseDate
              ? new Date(opp.targetCloseDate).toLocaleDateString()
              : t("crmOpportunities.detail.notSet")}
          </span>
        </div>
        <div>
          <span className="text-nx-ink-3 block">{t("crmOpportunities.detail.createdAt")}</span>
          <span className="font-medium text-nx-ink">
            {new Date(opp.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {opp.directCreateRationale && (
        <div className="mt-4 p-3 rounded-nx-md bg-nx-raised text-xs border border-nx-line">
          <span className="text-nx-ink-3 font-semibold block mb-0.5">
            {t("crmOpportunities.detail.directCreationRationale")}
          </span>
          <p className="text-nx-ink-2">{opp.directCreateRationale}</p>
        </div>
      )}

      {!isOpen && (
        <div className="mt-4 p-3 rounded-nx-md bg-nx-raised text-xs border border-nx-line space-y-1">
          <span className="text-nx-ink-3 font-semibold block">
            {t("crmOpportunities.detail.closureSummary")}
          </span>
          <div className="flex gap-4 text-nx-ink-2">
            <span>
              {t("crmOpportunities.detail.outcome")} <strong>{opp.status}</strong>
            </span>
            {opp.lossReasonCode && (
              <span>
                {t("crmOpportunities.detail.lossReason")} <strong>{opp.lossReasonCode}</strong>
              </span>
            )}
            {opp.competitorName && (
              <span>
                {t("crmOpportunities.detail.competitor")} <strong>{opp.competitorName}</strong>
              </span>
            )}
            {opp.closedAtUtc && (
              <span>
                {t("crmOpportunities.detail.closedAt")}{" "}
                {new Date(opp.closedAtUtc).toLocaleString()}
              </span>
            )}
          </div>
          {opp.closeNotes && <p className="text-nx-ink mt-1 italic">&ldquo;{opp.closeNotes}&rdquo;</p>}
        </div>
      )}
    </Card>
  );
}
