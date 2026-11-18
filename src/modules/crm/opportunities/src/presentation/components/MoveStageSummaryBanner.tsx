"use client";

import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";

interface MoveStageSummaryBannerProps {
  t: (key: string, params?: Record<string, any>) => string;
  isRtl: boolean;
  opportunity: CrmOpportunity;
  effectivePartyId: string;
  targetStageKey: string;
  onTargetStageKeyChange: (val: string) => void;
  effectiveStages: Array<{ key: string; labelEn: string; labelAr: string; partyRequired?: boolean }>;
}

/** Displays deal context summary and target stage selector inside MoveStageDialog. */
export function MoveStageSummaryBanner({
  t,
  isRtl,
  opportunity,
  effectivePartyId,
  targetStageKey,
  onTargetStageKeyChange,
  effectiveStages,
}: MoveStageSummaryBannerProps) {
  return (
    <>
      <div className="rounded-nx-md border border-nx-line bg-nx-surface p-3 text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-nx-ink-3">{t("crmOpportunities.table.deal")}:</span>
          <span className="font-semibold text-nx-ink">{opportunity.title}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-nx-ink-3">{t("crmOpportunities.dialogs.stage.currentStage")}:</span>
          <span className="font-medium text-nx-ink">
            {isRtl && opportunity.stageLabelArSnapshot
              ? opportunity.stageLabelArSnapshot
              : opportunity.stageLabelEnSnapshot || opportunity.stageKey}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-nx-ink-3">{t("crmOpportunities.table.party")}:</span>
          <span className={effectivePartyId ? "text-success font-medium" : "text-nx-warning-strong font-medium"}>
            {effectivePartyId
              ? opportunity.accountDisplayName || opportunity.partyDisplayName || t("crmOpportunities.kanban.partyVerified")
              : t("crmOpportunities.kanban.partyUnlinked")}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="target-stage">{t("crmOpportunities.dialogs.stage.targetStageLabel")}</Label>
        <Select value={targetStageKey} onValueChange={onTargetStageKeyChange}>
          <SelectTrigger id="target-stage"><SelectValue /></SelectTrigger>
          <SelectContent>
            {effectiveStages.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {isRtl && s.labelAr ? s.labelAr : s.labelEn} {s.partyRequired ? `• (${t("crmOpportunities.dialogs.stage.accountContactRequired")})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
