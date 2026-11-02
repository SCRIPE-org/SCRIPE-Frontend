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
import { Alert, AlertDescription } from "@core/ui/alert";
import { AlertCircle, Building2, User, Link as LinkIcon, Check } from "lucide-react";
import type { CrmLead, LinkPartyToLeadInput } from "../../domain/entities/LeadEntity";

interface LinkPartyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: CrmLead | null;
  onSubmit: (input: LinkPartyToLeadInput) => Promise<boolean>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function LinkPartyDialog({
  open,
  onOpenChange,
  lead,
  onSubmit,
  isSubmitting = false,
  submitError,
}: LinkPartyDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [orgPartyId, setOrgPartyId] = useState<string>("");
  const [personPartyId, setPersonPartyId] = useState<string>("");
  const [createMissing, setCreateMissing] = useState<boolean>(true);

  useEffect(() => {
    if (open && lead) {
      setOrgPartyId(lead.organizationPartyId ?? "");
      setPersonPartyId(lead.personPartyId ?? "");
      setCreateMissing(true);
    }
  }, [open, lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    const success = await onSubmit({
      leadId: lead.id,
      organizationPartyId: orgPartyId.trim() || undefined,
      personPartyId: personPartyId.trim() || undefined,
      createMissingParties: createMissing,
      expectedRowVersion: lead.rowVersion ?? "",
    });

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-nx-surface border-nx-line" dir={isRtl ? "rtl" : "ltr"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink font-heading flex items-center gap-2">
              <LinkIcon className="size-4 text-nx-accent" />
              <span>{t("crmLeads.partyLink.dialogTitle")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("crmLeads.partyLink.dialogDescription")}
            </DialogDescription>
          </DialogHeader>

          {submitError && (
            <Alert variant="destructive" className="py-2 px-3">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Context box showing lead metadata */}
          <div className="rounded-nx-md bg-nx-surfaceSubtle border border-nx-line p-3 text-xs space-y-2">
            <div className="flex items-center gap-2 text-nx-ink font-semibold">
              <Building2 className="size-3.5 text-nx-ink-3" />
              <span>{lead?.companyName || t("crmLeads.partyLink.noCompany")}</span>
            </div>
            <div className="flex items-center gap-2 text-nx-ink-2">
              <User className="size-3.5 text-nx-ink-3" />
              <span>{lead?.fullName || `${lead?.firstName || ""} ${lead?.lastName || ""}`.trim() || t("crmLeads.partyLink.noContact")}</span>
              {lead?.email && <span className="text-nx-ink-3">({lead.email})</span>}
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* Organization Party ID */}
            <div className="space-y-1.5">
              <Label htmlFor="org-party-id" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.partyLink.organizationPartyIdLabel")}
              </Label>
              <Input
                id="org-party-id"
                value={orgPartyId}
                onChange={(e) => setOrgPartyId(e.target.value)}
                placeholder={t("crmLeads.partyLink.organizationPartyIdPlaceholder")}
                className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink font-mono"
              />
              <span className="text-[11px] text-nx-ink-3 block">
                {t("crmLeads.partyLink.organizationPartyIdHint")}
              </span>
            </div>

            {/* Person Party ID */}
            <div className="space-y-1.5">
              <Label htmlFor="person-party-id" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.partyLink.personPartyIdLabel")}
              </Label>
              <Input
                id="person-party-id"
                value={personPartyId}
                onChange={(e) => setPersonPartyId(e.target.value)}
                placeholder={t("crmLeads.partyLink.personPartyIdPlaceholder")}
                className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink font-mono"
              />
              <span className="text-[11px] text-nx-ink-3 block">
                {t("crmLeads.partyLink.personPartyIdHint")}
              </span>
            </div>

            {/* Auto-create missing parties toggle using Button */}
            <div className="pt-2">
              <Button
                type="button"
                variant={createMissing ? "default" : "outline"}
                size="sm"
                onClick={() => setCreateMissing(!createMissing)}
                className="h-8 gap-2 text-xs border-nx-line"
              >
                <div className="size-3.5 rounded border border-current flex items-center justify-center">
                  {createMissing && <Check className="size-2.5 stroke-[3]" />}
                </div>
                <span>{t("crmLeads.partyLink.autoCreateMissing")}</span>
              </Button>
            </div>
          </div>

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
              className="h-8 text-xs bg-nx-accent-fill text-nx-on-fill font-bold hover:brightness-105"
            >
              {isSubmitting
                ? t("crmLeads.partyLink.saving")
                : t("crmLeads.partyLink.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
