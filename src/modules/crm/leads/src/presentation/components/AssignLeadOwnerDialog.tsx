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
import type { CrmLead, AssignLeadOwnerInput } from "../../domain/entities/LeadEntity";

export interface AssignLeadOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: CrmLead | null;
  onSubmit: (input: AssignLeadOwnerInput) => Promise<boolean>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

/** Dialog to assign or reassign a commercial owner and optional team for a CRM lead. */
export function AssignLeadOwnerDialog({
  open,
  onOpenChange,
  lead,
  onSubmit,
  isSubmitting = false,
  submitError,
}: AssignLeadOwnerDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [ownerUserId, setOwnerUserId] = useState("");
  const [ownerTeamId, setOwnerTeamId] = useState("");
  const [assignmentReason, setAssignmentReason] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (lead && open) {
      setOwnerUserId(lead.ownerUserId || "");
      setOwnerTeamId(lead.ownerTeamId || "");
      setAssignmentReason("");
      setValidationError(null);
    }
  }, [lead, open]);

  if (!lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!ownerUserId.trim()) {
      setValidationError(t("crmLeads.assign.ownerRequiredError"));
      return;
    }
    const ok = await onSubmit({
      leadId: lead.id,
      ownerUserId: ownerUserId.trim(),
      ownerTeamId: ownerTeamId.trim() || undefined,
      assignmentReason: assignmentReason.trim() || undefined,
      expectedRowVersion: lead.rowVersion ?? "",
    });
    if (ok) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="size-5 text-nx-accent" />
            {t("crmLeads.assign.title")}
          </DialogTitle>
          <DialogDescription>{t("crmLeads.assign.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(submitError || validationError) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{submitError || validationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="lead-assign-owner">
              {t("crmLeads.assign.ownerLabel")} <span className="text-destructive">*</span>
            </Label>
            <CrmEntitySearchSelect
              id="lead-assign-owner"
              data-testid="lead-assign-owner-select"
              entityKind="user"
              value={ownerUserId}
              initialLabel={
                lead.ownerDisplayName ||
                (lead.ownerUserId ? t("crmLeads.assign.currentOwnerOption") : undefined)
              }
              onChange={(val) => {
                setOwnerUserId(val);
                if (validationError) setValidationError(null);
              }}
              placeholder={t("crmLeads.assign.ownerPlaceholder")}
              allowClear={false}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-assign-team">{t("crmLeads.assign.teamLabel")}</Label>
            <CrmEntitySearchSelect
              id="lead-assign-team"
              data-testid="lead-assign-team-select"
              entityKind="team"
              value={ownerTeamId}
              initialLabel={
                lead.ownerTeamDisplayName ||
                (lead.ownerTeamId ? t("crmLeads.assign.currentTeamOption") : undefined)
              }
              onChange={(val) => setOwnerTeamId(val)}
              placeholder={t("crmLeads.assign.teamPlaceholder")}
              allowClear
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-assign-reason">{t("crmLeads.assign.reasonLabel")}</Label>
            <Textarea
              id="lead-assign-reason"
              placeholder={t("crmLeads.assign.reasonPlaceholder")}
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t("crmLeads.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("crmLeads.assign.saving") : t("crmLeads.assign.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
