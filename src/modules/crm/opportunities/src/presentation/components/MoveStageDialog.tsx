"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { AlertCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import type { CrmOpportunity, MoveOpportunityStageInput } from "../../domain/entities/OpportunityEntity";

/**
 * Properties for MoveStageDialog.
 */
export interface MoveStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: CrmOpportunity | null;
  onSubmit: (input: MoveOpportunityStageInput) => Promise<boolean>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const ACTIVE_STAGES = [
  { key: "default.discovery", order: 10, labelEn: "Discovery" },
  { key: "default.qualification", order: 20, labelEn: "Qualification" },
  { key: "default.solution_fit", order: 30, labelEn: "Solution Fit" },
  { key: "default.proposal", order: 40, labelEn: "Proposal", partyRequired: true },
  { key: "default.negotiation", order: 50, labelEn: "Negotiation", partyRequired: true },
];

/**
 * Dialog to advance or override the pipeline stage of an active opportunity.
 */
export function MoveStageDialog({
  open,
  onOpenChange,
  opportunity,
  onSubmit,
  isSubmitting = false,
  submitError,
}: MoveStageDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [targetStageKey, setTargetStageKey] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (opportunity) {
      const currentIndex = ACTIVE_STAGES.findIndex((s) => s.key === opportunity.stageKey);
      const nextStage = ACTIVE_STAGES[currentIndex + 1] ?? ACTIVE_STAGES[currentIndex] ?? ACTIVE_STAGES[0];
      setTargetStageKey(nextStage.key);
      setReason("");
      setValidationError(null);
    }
  }, [opportunity]);

  if (!opportunity) return null;

  const currentStageIndex = ACTIVE_STAGES.findIndex((s) => s.key === opportunity.stageKey);
  const targetStageIndex = ACTIVE_STAGES.findIndex((s) => s.key === targetStageKey);
  const isAdjacentForward = targetStageIndex === currentStageIndex + 1;
  const isTargetProposalOrLater = targetStageKey === "default.proposal" || targetStageKey === "default.negotiation";
  const lacksParty = isTargetProposalOrLater && !opportunity.partyId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (lacksParty) {
      setValidationError(t("crmOpportunities.dialogs.stage.partyNotice"));
      return;
    }

    if (!isAdjacentForward) {
      if (!reason.trim() || reason.trim().length < 5) {
        setValidationError("An audited override reason of at least 5 characters is required for non-sequential transitions.");
        return;
      }
    }

    const payload: MoveOpportunityStageInput = {
      opportunityId: opportunity.id,
      targetStageKey,
      reason: reason.trim() || undefined,
      expectedRowVersion: opportunity.rowVersion,
    };

    const success = await onSubmit(payload);
    if (success) {
      onOpenChange(false);
      setReason("");
      setValidationError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("crmOpportunities.dialogs.stage.title")}</DialogTitle>
          <DialogDescription>
            {t("crmOpportunities.dialogs.stage.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(submitError || validationError) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{submitError || validationError}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-nx-md border border-nx-line bg-nx-surface p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-nx-ink-3">Deal:</span>
              <span className="font-semibold text-nx-ink">{opportunity.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-nx-ink-3">Current Stage:</span>
              <span className="font-medium text-nx-ink">{opportunity.stageLabelEnSnapshot || opportunity.stageKey}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-nx-ink-3">Linked Party:</span>
              <span className={opportunity.partyId ? "text-success font-medium" : "text-destructive font-medium"}>
                {opportunity.partyId ? "Verified Party Linked" : "None (Unlinked)"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target-stage">{t("crmOpportunities.dialogs.stage.targetStageLabel")}</Label>
            <Select value={targetStageKey} onValueChange={setTargetStageKey}>
              <SelectTrigger id="target-stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVE_STAGES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.labelEn} {s.partyRequired ? "(Party Required)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {lacksParty && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                <strong>PD-1 Stage Gate Enforced:</strong> A verified canonical Party must be linked before advancing to Proposal or Negotiation.
              </AlertDescription>
            </Alert>
          )}

          {!isAdjacentForward && (
            <div className="space-y-2 rounded-nx-md border border-warning/30 bg-warning/5 p-3">
              <div className="flex items-center gap-2 text-warning text-xs font-semibold">
                <ShieldAlert className="size-4" />
                <span>{t("crmOpportunities.dialogs.stage.overrideNotice")}</span>
              </div>
              <div className="space-y-1">
                <Label htmlFor="stage-reason" className="text-xs">
                  {t("crmOpportunities.dialogs.stage.reasonLabel")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="stage-reason"
                  placeholder={t("crmOpportunities.dialogs.stage.reasonPlaceholder")}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("crmOpportunities.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || lacksParty}>
              {isSubmitting
                ? t("crmOpportunities.actions.saving")
                : t("crmOpportunities.dialogs.stage.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
