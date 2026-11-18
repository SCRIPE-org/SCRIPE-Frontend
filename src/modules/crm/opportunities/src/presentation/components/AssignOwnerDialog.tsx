"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { CrmEntitySearchSelect } from "@modules/crm";
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
import { AlertCircle, UserCheck } from "lucide-react";
import type { CrmOpportunity, AssignOpportunityOwnerInput } from "../../domain/entities/OpportunityEntity";

/**
 * Properties for AssignOwnerDialog.
 */
export interface AssignOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: CrmOpportunity | null;
  onSubmit: (input: AssignOpportunityOwnerInput) => Promise<boolean>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

/**
 * Dialog to reassign an opportunity to a commercial representative and optional commercial team.
 */
export function AssignOwnerDialog({
  open,
  onOpenChange,
  opportunity,
  onSubmit,
  isSubmitting = false,
  submitError,
}: AssignOwnerDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [ownerUserId, setOwnerUserId] = useState<string>("");
  const [ownerTeamId, setOwnerTeamId] = useState<string>("");
  const [assignmentReason, setAssignmentReason] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const currentOwnerUserId = opportunity?.ownerUserId;
  const currentOwnerTeamId = opportunity?.ownerTeamId;
  const currentOwnerDisplayName = opportunity?.ownerDisplayName;
  const currentOwnerTeamName = opportunity?.ownerTeamDisplayName;

  useEffect(() => {
    if (opportunity) {
      setOwnerUserId(opportunity.ownerUserId || "");
      setOwnerTeamId(opportunity.ownerTeamId || "");
      setAssignmentReason("");
      setValidationError(null);
    }
  }, [opportunity]);

  if (!opportunity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!ownerUserId.trim()) {
      setValidationError(t("crmOpportunities.dialogs.assign.ownerRequiredError"));
      return;
    }

    const resolvedTeamId = ownerTeamId.trim() || undefined;

    const payload: AssignOpportunityOwnerInput = {
      opportunityId: opportunity.id,
      ownerUserId: ownerUserId.trim(),
      ownerTeamId: resolvedTeamId,
      assignmentReason: assignmentReason.trim() || undefined,
      expectedRowVersion: opportunity.rowVersion,
    };

    const success = await onSubmit(payload);
    if (success) {
      onOpenChange(false);
      setAssignmentReason("");
      setValidationError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="size-5 text-nx-accent" />
            {t("crmOpportunities.dialogs.assign.title")}
          </DialogTitle>
          <DialogDescription>
            {t("crmOpportunities.dialogs.assign.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(submitError || validationError) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{submitError || validationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="assign-owner-id">
              {t("crmOpportunities.dialogs.assign.ownerLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <CrmEntitySearchSelect
              id="assign-owner-id"
              entityKind="user"
              value={ownerUserId}
              initialLabel={
                currentOwnerDisplayName ||
                (currentOwnerUserId ? t("crmOpportunities.dialogs.assign.currentOwnerOption") : undefined)
              }
              onChange={(val) => {
                setOwnerUserId(val);
                if (validationError) setValidationError(null);
              }}
              placeholder={t("crmOpportunities.dialogs.assign.ownerPlaceholder")}
              allowClear={false}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assign-team-id">{t("crmOpportunities.dialogs.assign.teamLabel")}</Label>
            <CrmEntitySearchSelect
              id="assign-team-id"
              entityKind="team"
              value={ownerTeamId}
              initialLabel={
                currentOwnerTeamName ||
                (currentOwnerTeamId ? t("crmOpportunities.dialogs.assign.currentTeamOption") : undefined)
              }
              onChange={(val) => setOwnerTeamId(val)}
              placeholder={t("crmOpportunities.dialogs.assign.teamPlaceholder")}
              allowClear
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assign-reason">
              {t("crmOpportunities.dialogs.assign.reasonLabel")}
            </Label>
            <Textarea
              id="assign-reason"
              placeholder={t("crmOpportunities.dialogs.assign.reasonPlaceholder")}
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              rows={2}
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
                : t("crmOpportunities.dialogs.assign.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
