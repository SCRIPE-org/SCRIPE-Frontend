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
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@core/common/utils";
import type { CrmLead, QualifyLeadInput, QualificationDecision } from "../../domain/models/crm-lead.types";

interface QualifyLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: CrmLead | null;
  onSubmit: (input: QualifyLeadInput) => Promise<boolean>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function QualifyLeadDialog({
  open,
  onOpenChange,
  lead,
  onSubmit,
  isSubmitting = false,
  submitError,
}: QualifyLeadDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [decision, setDecision] = useState<QualificationDecision>("Qualified");
  const [reasonCode, setReasonCode] = useState<string>("BUDGET");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDecision("Qualified");
      setReasonCode("BUDGET");
      setReason("");
      setNotes("");
      setValidationError(null);
    }
  }, [open, lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    if (decision === "Disqualified" && !reason.trim()) {
      setValidationError(t("crmLeads.qualification.reasonRequired") || "Disqualification reason is required");
      return;
    }

    setValidationError(null);

    const success = await onSubmit({
      leadId: lead.id,
      decision,
      disqualificationReasonCode: decision === "Disqualified" ? reasonCode : undefined,
      disqualificationReason: decision === "Disqualified" ? reason.trim() : undefined,
      qualificationNotes: decision === "Qualified" ? (notes.trim() || undefined) : undefined,
      expectedRowVersion: lead.rowVersion ?? "",
    });

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-nx-surface border-nx-line" dir={isRtl ? "rtl" : "ltr"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink font-heading">
              {t("crmLeads.qualification.dialogTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {lead?.title ?? ""} • {lead?.companyName || lead?.fullName || ""}
            </DialogDescription>
          </DialogHeader>

          {(submitError || validationError) && (
            <Alert variant="destructive" className="py-2 px-3">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{submitError || validationError}</AlertDescription>
            </Alert>
          )}

          {/* Decision Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-nx-ink">
              {t("crmLeads.qualification.decisionLabel")}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={decision === "Qualified" ? "default" : "outline"}
                size="sm"
                onClick={() => setDecision("Qualified")}
                className={cn(
                  "h-9 gap-1.5 text-xs font-medium rounded-nx-md border",
                  decision === "Qualified"
                    ? "bg-nx-accent-fill text-nx-on-fill border-transparent font-bold"
                    : "border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-surfaceSubtle"
                )}
              >
                <CheckCircle2 className="size-4" />
                <span>{t("crmLeads.qualification.qualified")}</span>
              </Button>

              <Button
                type="button"
                variant={decision === "Disqualified" ? "destructive" : "outline"}
                size="sm"
                onClick={() => setDecision("Disqualified")}
                className={cn(
                  "h-9 gap-1.5 text-xs font-medium rounded-nx-md border",
                  decision === "Disqualified"
                    ? "bg-destructive text-destructive-foreground border-transparent font-bold"
                    : "border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-surfaceSubtle"
                )}
              >
                <XCircle className="size-4" />
                <span>{t("crmLeads.qualification.disqualified")}</span>
              </Button>
            </div>
          </div>

          {decision === "Qualified" ? (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="qualify-notes" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.qualification.notesLabel")}
              </Label>
              <Textarea
                id="qualify-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("crmLeads.qualification.notesPlaceholder")}
                className="text-xs border-nx-line bg-nx-ground text-nx-ink resize-none"
              />
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="disqualify-code" className="text-xs font-semibold text-nx-ink">
                  {t("crmLeads.qualification.reasonCodeLabel")}
                </Label>
                <Input
                  id="disqualify-code"
                  value={reasonCode}
                  onChange={(e) => setReasonCode(e.target.value)}
                  placeholder="e.g. BUDGET, TIMING, COMPETITOR"
                  className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink uppercase font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="disqualify-reason" className="text-xs font-semibold text-nx-ink">
                  {t("crmLeads.qualification.reasonLabel")} *
                </Label>
                <Textarea
                  id="disqualify-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t("crmLeads.qualification.reasonPlaceholder")}
                  className="text-xs border-nx-line bg-nx-ground text-nx-ink resize-none"
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-nx-line gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 text-xs border-nx-line bg-nx-surface text-nx-ink"
            >
              {t("crmLeads.actions.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className={cn(
                "h-8 text-xs font-bold hover:brightness-105",
                decision === "Qualified"
                  ? "bg-nx-accent-fill text-nx-on-fill"
                  : "bg-destructive text-destructive-foreground"
              )}
            >
              {isSubmitting
                ? t("crmLeads.qualification.saving")
                : t("crmLeads.qualification.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
