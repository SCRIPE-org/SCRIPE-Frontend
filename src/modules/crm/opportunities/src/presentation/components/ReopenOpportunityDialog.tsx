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
import { AlertCircle, RotateCcw } from "lucide-react";
import type { CrmOpportunity, ReopenOpportunityInput } from "../../domain/entities/OpportunityEntity";

/**
 * Properties for ReopenOpportunityDialog.
 */
export interface ReopenOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: CrmOpportunity | null;
  onSubmit: (input: ReopenOpportunityInput) => Promise<boolean>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

/**
 * Dialog to reopen a previously closed opportunity back to its last active stage.
 */
export function ReopenOpportunityDialog({
  open,
  onOpenChange,
  opportunity,
  onSubmit,
  isSubmitting = false,
  submitError,
}: ReopenOpportunityDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [reason, setReason] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (opportunity) {
      setReason("");
      setValidationError(null);
    }
  }, [opportunity]);

  if (!opportunity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!reason.trim() || reason.trim().length < 5) {
      setValidationError("An audited reason of at least 5 characters is required to reopen this opportunity.");
      return;
    }

    const payload: ReopenOpportunityInput = {
      opportunityId: opportunity.id,
      reason: reason.trim(),
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
      <DialogContent className="max-w-md" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="size-5 text-nx-accent" />
            {t("crmOpportunities.dialogs.reopen.title")}
          </DialogTitle>
          <DialogDescription>
            {t("crmOpportunities.dialogs.reopen.description")}
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
              <span className="text-nx-ink-3">Restored Stage:</span>
              <span className="font-medium text-nx-ink">
                {opportunity.lastActiveStageKey || "default.discovery"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reopen-reason">
              {t("crmOpportunities.dialogs.reopen.reasonLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reopen-reason"
              placeholder={t("crmOpportunities.dialogs.reopen.reasonPlaceholder")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("crmOpportunities.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("crmOpportunities.actions.saving")
                : t("crmOpportunities.dialogs.reopen.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
