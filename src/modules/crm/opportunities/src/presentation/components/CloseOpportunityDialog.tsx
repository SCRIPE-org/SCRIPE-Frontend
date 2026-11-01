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
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { AlertCircle, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { CrmOpportunity, CloseOpportunityInput, OpportunityStatus, DealKind } from "../../domain/entities/OpportunityEntity";

/**
 * Properties for CloseOpportunityDialog.
 */
export interface CloseOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: CrmOpportunity | null;
  initialOutcome?: OpportunityStatus;
  onSubmit: (input: CloseOpportunityInput) => Promise<boolean>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

/**
 * Dialog to close an opportunity as Won or Lost with audit tracking and required rationale.
 */
export function CloseOpportunityDialog({
  open,
  onOpenChange,
  opportunity,
  initialOutcome = "Won",
  onSubmit,
  isSubmitting = false,
  submitError,
}: CloseOpportunityDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [outcome, setOutcome] = useState<OpportunityStatus>(initialOutcome);
  const [closeNotes, setCloseNotes] = useState<string>("");
  const [lossReasonCode, setLossReasonCode] = useState<string>("budget_cut");
  const [competitorName, setCompetitorName] = useState<string>("");
  const [dealKind, setDealKind] = useState<DealKind>("NewBusiness");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (opportunity) {
      setOutcome(initialOutcome);
      setCloseNotes("");
      setLossReasonCode("budget_cut");
      setCompetitorName("");
      setDealKind(opportunity.dealKind || "NewBusiness");
      setValidationError(null);
    }
  }, [opportunity, initialOutcome]);

  if (!opportunity) return null;

  const isWon = outcome === "Won";
  const lacksPartyForWon = isWon && !opportunity.partyId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (isWon) {
      if (lacksPartyForWon) {
        setValidationError(t("crmOpportunities.dialogs.close.partyRequiredNotice"));
        return;
      }
      if (!closeNotes.trim()) {
        setValidationError("Close notes are required when closing an opportunity as Won.");
        return;
      }
    } else {
      if (!lossReasonCode.trim()) {
        setValidationError("A loss reason code is required when closing as Lost.");
        return;
      }
      if (lossReasonCode === "competitor" && !competitorName.trim()) {
        setValidationError("Competitor name is required when closing with loss reason 'competitor'.");
        return;
      }
    }

    const payload: CloseOpportunityInput = {
      opportunityId: opportunity.id,
      outcome,
      dealKind,
      closeNotes: closeNotes.trim() || undefined,
      lossReasonCode: !isWon ? lossReasonCode : undefined,
      competitorName: !isWon && lossReasonCode === "competitor" ? competitorName.trim() : undefined,
      expectedRowVersion: opportunity.rowVersion,
    };

    const success = await onSubmit(payload);
    if (success) {
      onOpenChange(false);
      setCloseNotes("");
      setCompetitorName("");
      setValidationError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("crmOpportunities.dialogs.close.title")}</DialogTitle>
          <DialogDescription>
            {t("crmOpportunities.dialogs.close.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(submitError || validationError) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{submitError || validationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>{t("crmOpportunities.dialogs.close.outcomeLabel")}</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className={`flex items-center justify-center gap-2 p-3 h-auto text-sm font-semibold transition-colors ${
                  outcome === "Won"
                    ? "border-success bg-success/15 text-success hover:bg-success/20"
                    : "border-nx-line bg-nx-surface text-nx-ink-2 hover:text-nx-ink"
                }`}
                onClick={() => setOutcome("Won")}
              >
                <CheckCircle className="size-4" />
                {t("crmOpportunities.dialogs.close.outcomeWon")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={`flex items-center justify-center gap-2 p-3 h-auto text-sm font-semibold transition-colors ${
                  outcome === "Lost"
                    ? "border-destructive bg-destructive/15 text-destructive hover:bg-destructive/20"
                    : "border-nx-line bg-nx-surface text-nx-ink-2 hover:text-nx-ink"
                }`}
                onClick={() => setOutcome("Lost")}
              >
                <XCircle className="size-4" />
                {t("crmOpportunities.dialogs.close.outcomeLost")}
              </Button>
            </div>
          </div>

          {isWon && lacksPartyForWon && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                <strong>PD-1 Non-Bypassable Party Gate:</strong> A verified canonical Party must be linked before closing this opportunity as Won. Link a party first or close as Lost.
              </AlertDescription>
            </Alert>
          )}

          {isWon ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="close-notes">
                  {t("crmOpportunities.dialogs.close.closeNotesLabel")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="close-notes"
                  placeholder={t("crmOpportunities.dialogs.close.closeNotesPlaceholder")}
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="close-deal-kind">{t("crmOpportunities.dialogs.create.dealKindLabel")}</Label>
                <Select value={dealKind} onValueChange={(val) => setDealKind(val as DealKind)}>
                  <SelectTrigger id="close-deal-kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NewBusiness">New Business</SelectItem>
                    <SelectItem value="Expansion">Expansion</SelectItem>
                    <SelectItem value="Renewal">Renewal</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="loss-reason">{t("crmOpportunities.dialogs.close.lossReasonLabel")}</Label>
                <Select value={lossReasonCode} onValueChange={setLossReasonCode}>
                  <SelectTrigger id="loss-reason">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget_cut">Budget Cut / Cancelled</SelectItem>
                    <SelectItem value="competitor">Lost to Competitor</SelectItem>
                    <SelectItem value="pricing">Price Mismatch</SelectItem>
                    <SelectItem value="timing">Poor Timing / Deferred</SelectItem>
                    <SelectItem value="feature_gap">Feature / Capability Gap</SelectItem>
                    <SelectItem value="no_decision">No Decision / Stalled</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {lossReasonCode === "competitor" && (
                <div className="space-y-1.5">
                  <Label htmlFor="competitor-name">
                    {t("crmOpportunities.dialogs.close.competitorLabel")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="competitor-name"
                    placeholder={t("crmOpportunities.dialogs.close.competitorPlaceholder")}
                    value={competitorName}
                    onChange={(e) => setCompetitorName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="lost-notes">Close Notes (Optional)</Label>
                <Textarea
                  id="lost-notes"
                  placeholder="Additional context on why this deal was lost..."
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
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
            <Button type="submit" disabled={isSubmitting || (isWon && lacksPartyForWon)}>
              {isSubmitting
                ? t("crmOpportunities.actions.saving")
                : t("crmOpportunities.dialogs.close.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
