"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { History } from "lucide-react";
import { OpportunityStageBadge } from "./OpportunityStageBadge";
import type { CrmOpportunityStageHistory } from "../../domain/entities/OpportunityEntity";

/**
 * Properties for OpportunityAuditTimeline.
 */
export interface OpportunityAuditTimelineProps {
  stageHistory: CrmOpportunityStageHistory[];
  isRtl?: boolean;
}

/**
 * Timeline component displaying historical stage transitions, skips, and override justifications.
 */
export function OpportunityAuditTimeline({ stageHistory, isRtl }: OpportunityAuditTimelineProps) {
  const { t } = useI18n();

  return (
    <Card className="p-6 border-nx-line bg-nx-surface">
      <div className="flex items-center gap-2 mb-4">
        <History className="size-5 text-nx-accent" />
        <h2 className="text-base font-bold text-nx-ink">
          {t("crmOpportunities.detail.stageHistory")}
        </h2>
      </div>

      {stageHistory.length === 0 ? (
        <p className="text-xs text-nx-ink-3 text-center py-6">
          {t("crmOpportunities.detail.noHistory")}
        </p>
      ) : (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse" dir={isRtl ? "rtl" : "ltr"}>
            <thead>
              <tr className="border-b border-nx-line bg-nx-raised/50 text-nx-ink-2 font-semibold">
                <th className="px-4 py-2.5 text-start">{t("crmOpportunities.detail.occurredAt")}</th>
                <th className="px-4 py-2.5 text-start">{t("crmOpportunities.detail.fromStage")}</th>
                <th className="px-4 py-2.5 text-start">{t("crmOpportunities.detail.toStage")}</th>
                <th className="px-4 py-2.5 text-start">{t("crmOpportunities.detail.transitionType")}</th>
                <th className="px-4 py-2.5 text-start">{t("crmOpportunities.detail.reason")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nx-line">
              {stageHistory.map((hist) => (
                <tr key={hist.id} className="hover:bg-nx-raised/30">
                  <td className="px-4 py-2.5 text-nx-ink-3 whitespace-nowrap">
                    {new Date(hist.occurredAtUtc).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5">
                    {hist.fromStageKey ? (
                      <OpportunityStageBadge
                        stageKey={hist.fromStageKey}
                        label={hist.fromStageLabelEnSnapshot || hist.fromStageKey}
                      />
                    ) : (
                      <span className="text-nx-ink-3">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <OpportunityStageBadge
                      stageKey={hist.toStageKey}
                      label={hist.toStageLabelEnSnapshot || hist.toStageKey}
                    />
                  </td>
                  <td className="px-4 py-2.5 font-medium">
                    {hist.usedStageOverride ? (
                      <span className="text-warning font-semibold">Stage Override</span>
                    ) : (
                      <span className="text-nx-ink-2">{hist.transitionKind}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-nx-ink-2 max-w-sm truncate">
                    {hist.reason || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
