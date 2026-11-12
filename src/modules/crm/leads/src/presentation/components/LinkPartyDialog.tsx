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
import { Switch } from "@core/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { Alert, AlertDescription } from "@core/ui/alert";
import { AlertCircle, Building2, UserCheck, Search } from "lucide-react";
import type { CrmLead, LinkPartyToLeadInput } from "../../domain/entities/LeadEntity";

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
  onLookupParties,
  isSubmitting = false,
  submitError,
}: LinkPartyDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [organizationPartyId, setOrganizationPartyId] = useState("__auto");
  const [personPartyId, setPersonPartyId] = useState("__auto");
  const [createMissingParties, setCreateMissingParties] = useState(true);

  const [orgSearch, setOrgSearch] = useState("");
  const [personSearch, setPersonSearch] = useState("");
  const [candidateOrgs, setCandidateOrgs] = useState<LeadCandidatePartyOption[]>([]);
  const [candidatePeople, setCandidatePeople] = useState<LeadCandidatePartyOption[]>([]);

  useEffect(() => {
    if (open && lead) {
      setOrganizationPartyId(lead.organizationPartyId ?? "__auto");
      setPersonPartyId(lead.personPartyId ?? "__auto");
      setCreateMissingParties(true);
      setOrgSearch("");
      setPersonSearch("");
    }
  }, [open, lead]);

  useEffect(() => {
    if (!open || !onLookupParties) return;
    let active = true;
    const loadOrgs = async () => {
      try {
        const orgs = await onLookupParties(orgSearch, "Organization");
        if (active) setCandidateOrgs(orgs);
      } catch {
        if (active) setCandidateOrgs([]);
      }
    };
    loadOrgs();
    return () => {
      active = false;
    };
  }, [open, orgSearch, onLookupParties]);

  useEffect(() => {
    if (!open || !onLookupParties) return;
    let active = true;
    const loadPeople = async () => {
      try {
        const people = await onLookupParties(personSearch, "Person");
        if (active) setCandidatePeople(people);
      } catch {
        if (active) setCandidatePeople([]);
      }
    };
    loadPeople();
    return () => {
      active = false;
    };
  }, [open, personSearch, onLookupParties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    const resolvedOrgId =
      organizationPartyId && organizationPartyId !== "__auto"
        ? organizationPartyId.trim()
        : undefined;
    const resolvedPersonId =
      personPartyId && personPartyId !== "__auto"
        ? personPartyId.trim()
        : undefined;

    const success = await onSubmit({
      leadId: lead.id,
      organizationPartyId: resolvedOrgId,
      personPartyId: resolvedPersonId,
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
              <div className="relative">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3 text-nx-ink-3 pointer-events-none" />
                <Input
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  placeholder={t("crmLeads.partyLink.filterOrganizations")}
                  className="h-7 ps-7 text-xs border-nx-line bg-nx-ground text-nx-ink mb-1"
                />
              </div>
              <Select value={organizationPartyId} onValueChange={setOrganizationPartyId}>
                <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__auto">
                    {lead?.companyName
                      ? `Auto-create or match "${lead.companyName}"`
                      : t("crmLeads.partyLink.organizationPartyIdHint")}
                  </SelectItem>
                  {candidateOrgs.map((org) => (
                    <SelectItem key={org.partyId} value={org.partyId}>
                      {org.legalNameEn}
                      {org.legalNameAr ? ` — ${org.legalNameAr}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact Person Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.partyLink.personPartyIdLabel")}
              </Label>
              <div className="relative">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3 text-nx-ink-3 pointer-events-none" />
                <Input
                  value={personSearch}
                  onChange={(e) => setPersonSearch(e.target.value)}
                  placeholder={t("crmLeads.partyLink.filterContacts")}
                  className="h-7 ps-7 text-xs border-nx-line bg-nx-ground text-nx-ink mb-1"
                />
              </div>
              <Select value={personPartyId} onValueChange={setPersonPartyId}>
                <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__auto">
                    {lead?.fullName
                      ? `Auto-create or match "${lead.fullName}"`
                      : t("crmLeads.partyLink.personPartyIdHint")}
                  </SelectItem>
                  {candidatePeople.map((person) => (
                    <SelectItem key={person.partyId} value={person.partyId}>
                      {person.legalNameEn}
                      {person.legalNameAr ? ` — ${person.legalNameAr}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
