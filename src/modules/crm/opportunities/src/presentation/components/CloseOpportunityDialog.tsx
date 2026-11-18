"use client";

import { useState } from "react";
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
import { AlertCircle, AlertTriangle } from "lucide-react";
import { useCrmSettingsStore, DEFAULT_CONFIGURED_LOSS_REASONS } from "@modules/crm";
import type { CrmOpportunity, CloseOpportunityInput, OpportunityStatus, DealKind } from "../../domain/entities/OpportunityEntity";
import { CloseOutcomeToggle } from "./CloseOutcomeToggle";

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
  const configuredLossReasons = useCrmSettingsStore((s) => s.configuredLossReasons) ?? DEFAULT_CONFIGURED_LOSS_REASONS;

  const [outcome, setOutcome] = useState<OpportunityStatus>(initialOutcome);
  const [closeNotes, setCloseNotes] = useState<string>("");
  const [lossReasonCode, setLossReasonCode] = useState<string>("budget_cut");
  const [competitorName, setCompetitorName] = useState<string>("");
  const [dealKind, setDealKind] = useState<DealKind>("NewBusiness");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [prevSyncKey, setPrevSyncKey] = useState("");

  const syncKey = open && opportunity ? `${opportunity.id}:${initialOutcome}` : "";
  if (syncKey && syncKey !== prevSyncKey && opportunity) {
    setPrevSyncKey(syncKey);
    setOutcome(initialOutcome);
    setCloseNotes("");
    setLossReasonCode("budget_cut");
    setCompetitorName("");
    setDealKind(opportunity.dealKind || "NewBusiness");
    setValidationError(null);
  } else if (!open && prevSyncKey !== "") {
    setPrevSyncKey("");
  }

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
        setValidationError(t("crmOpportunities.dialogs.close.closeNotesRequiredWon"));
        return;
      }
    } else {
      if (!lossReasonCode.trim()) {
        setValidationError(t("crmOpportunities.dialogs.close.lossReasonRequiredLost"));
        return;
      }
      if (lossReasonCode === "competitor" && !competitorName.trim()) {
        setValidationError(t("crmOpportunities.dialogs.close.competitorRequiredError"));
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

          <CloseOutcomeToggle
            outcome={outcome}
            onOutcomeChange={setOutcome}
            label={t("crmOpportunities.dialogs.close.outcomeLabel")}
            wonLabel={t("crmOpportunities.dialogs.close.outcomeWon")}
            lostLabel={t("crmOpportunities.dialogs.close.outcomeLost")}
          />

          {isWon && lacksPartyForWon && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                <strong>{t("crmOpportunities.dialogs.close.partyRequiredAlertTitle")}</strong>{" "}
                {t("crmOpportunities.dialogs.close.partyRequiredAlertBody")}
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
                    <SelectItem value="NewBusiness">{t("crmOpportunities.dealKind.NewBusiness")}</SelectItem>
                    <SelectItem value="Expansion">{t("crmOpportunities.dealKind.Expansion")}</SelectItem>
                    <SelectItem value="Renewal">{t("crmOpportunities.dealKind.Renewal")}</SelectItem>
                    <SelectItem value="Services">{t("crmOpportunities.dealKind.Services")}</SelectItem>
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
                    {configuredLossReasons.map((item) => {
                      const i18nKey = `crmOpportunities.dialogs.close.lossReasons.${item.code}`;
                      const translated = t(i18nKey);
                      const label = translated !== i18nKey ? translated : (isRtl ? item.labelAr : item.labelEn);
                      return (
                        <SelectItem key={item.code} value={item.code}>
                          {label}
                        </SelectItem>
                      );
                    })}
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
                <Label htmlFor="lost-notes">{t("crmOpportunities.dialogs.close.lostNotesLabel")}</Label>
                <Textarea
                  id="lost-notes"
                  placeholder={t("crmOpportunities.dialogs.close.lostNotesPlaceholder")}
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
