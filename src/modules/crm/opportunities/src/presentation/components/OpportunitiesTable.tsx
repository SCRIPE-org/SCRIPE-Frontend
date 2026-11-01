"use client";

import { useI18n } from "@core/providers/i18n-provider";
import {
  Briefcase,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { cn } from "@core/common/utils";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";
import { OpportunityStatusBadge } from "./OpportunityStatusBadge";
import { OpportunityStageBadge } from "./OpportunityStageBadge";

/**
 * Properties for OpportunitiesTable.
 */
export interface OpportunitiesTableProps {
  opportunities: CrmOpportunity[];
  onMoveStage: (opp: CrmOpportunity) => void;
  onCloseWon: (opp: CrmOpportunity) => void;
  onCloseLost: (opp: CrmOpportunity) => void;
  onReopen: (opp: CrmOpportunity) => void;
  onAssignOwner: (opp: CrmOpportunity) => void;
  onSelectOpportunity?: (opp: CrmOpportunity) => void;
  className?: string;
}

/**
 * Table displaying CRM opportunities with stage indicators and action menus.
 */
export function OpportunitiesTable({
  opportunities,
  onMoveStage,
  onCloseWon,
  onCloseLost,
  onReopen,
  onAssignOwner,
  onSelectOpportunity,
  className,
}: OpportunitiesTableProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  if (opportunities.length === 0) {
    return (
      <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-8 text-center">
        <EmptyState
          title={t("crmOpportunities.table.emptyTitle")}
          description={t("crmOpportunities.table.emptyDescription")}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-nx-lg border border-nx-line bg-nx-surface overflow-hidden",
        className
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs border-collapse" dir={isRtl ? "rtl" : "ltr"}>
          <thead>
            <tr className="border-b border-nx-line bg-nx-surfaceSubtle/50 text-nx-ink-2 font-semibold">
              <th className="px-4 py-3 text-start">{t("crmOpportunities.table.title")}</th>
              <th className="px-4 py-3 text-start">{t("crmOpportunities.table.stage")}</th>
              <th className="px-4 py-3 text-start">{t("crmOpportunities.table.status")}</th>
              <th className="px-4 py-3 text-start">{t("crmOpportunities.table.amount")}</th>
              <th className="px-4 py-3 text-start">{t("crmOpportunities.table.party")}</th>
              <th className="px-4 py-3 text-start">{t("crmOpportunities.table.targetClose")}</th>
              <th className="px-4 py-3 text-start">{t("crmOpportunities.table.createdAt")}</th>
              <th className="px-4 py-3 text-end">{t("crmOpportunities.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nx-line">
            {opportunities.map((opp) => {
              const formattedDate = opp.createdAt
                ? new Date(opp.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              const formattedTargetClose = opp.targetCloseDate
                ? new Date(opp.targetCloseDate).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              const isOpen = opp.status === "Open";

              return (
                <tr
                  key={opp.id}
                  className="group hover:bg-nx-surfaceSubtle/40 transition-colors duration-nx-micro"
                >
                  {/* Title & Deal Kind */}
                  <td className="px-4 py-3 max-w-xs">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => onSelectOpportunity?.(opp)}
                      className="p-0 h-auto font-semibold text-nx-ink hover:text-nx-accent transition-colors line-clamp-1 text-start"
                    >
                      {opp.title}
                    </Button>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-nx-ink-3 uppercase font-mono">
                        {opp.dealKind}
                      </span>
                      {opp.directCreateRationale && (
                        <span className="text-[11px] text-nx-ink-3 truncate max-w-[140px]" title={opp.directCreateRationale}>
                          • {opp.directCreateRationale}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Stage */}
                  <td className="px-4 py-3">
                    <OpportunityStageBadge
                      stageKey={opp.stageKey}
                      label={language === "ar" && opp.stageLabelArSnapshot ? opp.stageLabelArSnapshot : opp.stageLabelEnSnapshot}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <OpportunityStatusBadge status={opp.status} />
                  </td>

                  {/* Estimated Amount */}
                  <td className="px-4 py-3 font-bold text-nx-ink whitespace-nowrap">
                    {opp.currencyCode} {Number(opp.estimatedAmount).toLocaleString()}
                  </td>

                  {/* Party Gate Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {opp.partyId ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-success font-medium">
                        <ShieldCheck className="size-3.5" />
                        Verified Party
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-nx-ink-3">
                        <ShieldAlert className="size-3.5 text-warning" />
                        Unlinked (Pre-proposal)
                      </span>
                    )}
                  </td>

                  {/* Target Close */}
                  <td className="px-4 py-3 text-nx-ink-2 whitespace-nowrap">
                    {formattedTargetClose}
                  </td>

                  {/* Created At */}
                  <td className="px-4 py-3 text-nx-ink-3 whitespace-nowrap">
                    {formattedDate}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-end whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {isOpen ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => onMoveStage(opp)}
                          >
                            <ArrowRight className="size-3.5 mr-1" />
                            {t("crmOpportunities.actions.moveStage")}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-success hover:bg-success/10"
                            onClick={() => onCloseWon(opp)}
                          >
                            <CheckCircle className="size-3.5 mr-1" />
                            {t("crmOpportunities.actions.closeWon")}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                            onClick={() => onCloseLost(opp)}
                          >
                            <XCircle className="size-3.5 mr-1" />
                            {t("crmOpportunities.actions.closeLost")}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-1.5 text-nx-ink-3 hover:text-nx-ink"
                            title={t("crmOpportunities.actions.assignOwner")}
                            onClick={() => onAssignOwner(opp)}
                          >
                            <UserCheck className="size-3.5" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs text-nx-accent border-nx-line hover:border-nx-accent"
                          onClick={() => onReopen(opp)}
                        >
                          <RotateCcw className="size-3 mr-1" />
                          {t("crmOpportunities.actions.reopen")}
                        </Button>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-1.5 text-nx-ink-3 hover:text-nx-ink"
                        title={t("crmOpportunities.actions.viewDetails")}
                        onClick={() => onSelectOpportunity?.(opp)}
                      >
                        <ArrowUpRight className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
