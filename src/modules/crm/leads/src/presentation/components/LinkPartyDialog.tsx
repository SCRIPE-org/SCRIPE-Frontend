"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { CrmEntitySearchSelect, type CrmEntitySearchItem } from "@modules/crm";
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
import { Switch } from "@core/ui/switch";
import { Alert, AlertDescription } from "@core/ui/alert";
import { AlertCircle, Building2, UserCheck } from "lucide-react";
import type { CrmLead, LinkPartyToLeadInput } from "../../domain/entities/LeadEntity";
import { buildLeadQuickCreateDefaults } from "../utils/leadTransitionHelpers";

export interface LeadCandidatePartyOption {
  partyId: string;
  legalNameEn: string;
  legalNameAr?: string | null;
  partyKind: string;
  isVerified: boolean;
}

interface LinkPartyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: CrmLead | null;
  onSubmit: (input: LinkPartyToLeadInput) => Promise<boolean>;
  onLookupParties?: (
    search?: string,
    partyKind?: "Organization" | "Person"
  ) => Promise<LeadCandidatePartyOption[]>;
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

  const [organizationPartyId, setOrganizationPartyId] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [personPartyId, setPersonPartyId] = useState("");
  const [createMissingParties, setCreateMissingParties] = useState(true);
  const [prevSyncKey, setPrevSyncKey] = useState("");

  const syncKey = open && lead ? `${lead.id}:${lead.rowVersion ?? ""}` : "";
  if (syncKey && syncKey !== prevSyncKey && lead) {
    setPrevSyncKey(syncKey);
    setOrganizationPartyId(lead.organizationPartyId ?? "");
    setSelectedAccountId(lead.accountId ?? "");
    setPersonPartyId(lead.personPartyId ?? "");
    setCreateMissingParties(true);
  } else if (!open && prevSyncKey !== "") {
    setPrevSyncKey("");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    const success = await onSubmit({
      leadId: lead.id,
      organizationPartyId: organizationPartyId.trim() || undefined,
      personPartyId: personPartyId.trim() || undefined,
      accountId: selectedAccountId.trim() || undefined,
      createMissingParties,
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
              {t("crmLeads.partyLink.dialogTitle")}
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

          {/* Lead Summary Box */}
          <div className="p-3 rounded-nx-md bg-nx-raised/50 border border-nx-line space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-nx-ink font-medium">
              <Building2 className="size-3.5 text-nx-ink-3 shrink-0" />
              <span>{lead?.companyName || t("crmLeads.partyLink.noCompany")}</span>
            </div>
            <div className="flex items-center gap-2 text-nx-ink-2">
              <UserCheck className="size-3.5 text-nx-ink-3 shrink-0" />
              <span>
                {lead?.fullName || t("crmLeads.partyLink.noContact")}
                {lead?.email ? ` (${lead.email})` : ""}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Organization Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.partyLink.organizationPartyIdLabel")}
              </Label>
              <CrmEntitySearchSelect
                data-testid="link-party-org-select"
                entityKind="account"
                valueMode="partyId"
                value={organizationPartyId}
                initialLabel={lead?.organizationDisplayName || lead?.accountDisplayName || lead?.companyName || undefined}
                onChange={(val: string, item?: CrmEntitySearchItem) => {
                  setOrganizationPartyId(val);
                  setSelectedAccountId(item?.accountId || "");
                }}
                placeholder={
                  lead?.companyName
                    ? t("crmLeads.partyLink.autoCreateMatchLabel", { name: lead.companyName })
                    : t("crmLeads.partyLink.organizationPartyIdHint")
                }
                enableQuickCreate
                quickCreateDefaultKind="account"
                quickCreateInitialValues={buildLeadQuickCreateDefaults(lead, "account")}
                allowClear
              />
            </div>

            {/* Contact Person Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.partyLink.personPartyIdLabel")}
              </Label>
              <CrmEntitySearchSelect
                data-testid="link-party-person-select"
                entityKind="contact"
                valueMode="partyId"
                accountId={selectedAccountId || undefined}
                value={personPartyId}
                initialLabel={lead?.personDisplayName || lead?.fullName || undefined}
                onChange={(val: string) => setPersonPartyId(val)}
                placeholder={
                  lead?.fullName
                    ? t("crmLeads.partyLink.autoCreateMatchLabel", { name: lead.fullName })
                    : t("crmLeads.partyLink.personPartyIdHint")
                }
                enableQuickCreate
                quickCreateDefaultKind="contact"
                quickCreateInitialValues={buildLeadQuickCreateDefaults(lead, "contact")}
                allowClear
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-nx-line/60">
              <Label
                htmlFor="auto-create-switch"
                className="text-xs font-medium text-nx-ink cursor-pointer"
              >
                {t("crmLeads.partyLink.autoCreateMissing")}
              </Label>
              <Switch
                id="auto-create-switch"
                checked={createMissingParties}
                onCheckedChange={setCreateMissingParties}
              />
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
              {isSubmitting ? t("crmLeads.partyLink.saving") : t("crmLeads.partyLink.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
