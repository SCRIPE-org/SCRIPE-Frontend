"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { PhoneInput } from "@core/ui/phone-input";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@core/ui/dialog";
import { AlertCircle, User, PlusCircle, Search, Building2 } from "lucide-react";
import { CustomFieldsSection } from "@core/crud/customFieldsExtension";
import type { CreateContactInput } from "../../domain/entities/ContactEntity";

export interface ContactCandidatePersonLookup {
  partyId: string;
  legalNameEn: string;
  legalNameAr?: string | null;
  partyKind: string;
  isVerified: boolean;
}

export interface ContactAccountLookup {
  id: string;
  partyLegalNameEn: string;
  partyLegalNameAr?: string | null;
}

interface CreateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateContactInput, customFieldValues?: Record<string, unknown>) => Promise<boolean>;
  onLookupPeople?: (search?: string) => Promise<ContactCandidatePersonLookup[]>;
  onLookupAccounts?: () => Promise<ContactAccountLookup[]>;
  isSubmitting: boolean;
  error: string | null;
  defaultAccountId?: string;
}

export function CreateContactDialog({
  open,
  onOpenChange,
  onSubmit,
  onLookupPeople,
  onLookupAccounts,
  isSubmitting,
  error,
  defaultAccountId = "",
}: CreateContactDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [mode, setMode] = useState<"create" | "select">("create");
  const [personPartyId, setPersonPartyId] = useState("");
  const [fullNameEn, setFullNameEn] = useState("");
  const [fullNameAr, setFullNameAr] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [primaryAccountId, setPrimaryAccountId] = useState(defaultAccountId || "__none");
  const [jobTitleSnapshot, setJobTitleSnapshot] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [commercialNotes, setCommercialNotes] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [candidatePeople, setCandidatePeople] = useState<ContactCandidatePersonLookup[]>([]);
  const [personSearch, setPersonSearch] = useState("");
  const [accounts, setAccounts] = useState<ContactAccountLookup[]>([]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    Promise.all([
      onLookupPeople ? onLookupPeople(personSearch) : Promise.resolve([]),
      onLookupAccounts ? onLookupAccounts() : Promise.resolve([]),
    ])
      .then(([peopleRes, accountsRes]) => {
        if (active) {
          setCandidatePeople(peopleRes);
          setAccounts(accountsRes ?? []);
        }
      })
      .catch(() => {
        if (active) setCandidatePeople([]);
      });
    return () => {
      active = false;
    };
  }, [open, personSearch, onLookupPeople, onLookupAccounts]);

  const resetForm = () => {
    setMode("create");
    setPersonPartyId("");
    setFullNameEn("");
    setFullNameAr("");
    setEmail("");
    setPhone("");
    setPrimaryAccountId(defaultAccountId || "__none");
    setJobTitleSnapshot("");
    setDepartmentName("");
    setCommercialNotes("");
    setCustomFields({});
    setValidationError(null);
    setPersonSearch("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (mode === "select" && !personPartyId.trim()) {
      setValidationError(t("crmContacts.create.personSelectRequired") || "Please select an existing contact person from the directory.");
      return;
    }
    if (mode === "create" && !fullNameEn.trim()) {
      setValidationError(t("crmContacts.create.fullNameRequired") || "Contact full name is required.");
      return;
    }
    const resolvedAccountId = primaryAccountId && primaryAccountId !== "__none" ? primaryAccountId.trim() : undefined;
    const ok = await onSubmit(
      {
        personPartyId: mode === "select" ? personPartyId.trim() : undefined,
        fullNameEn: mode === "create" ? fullNameEn.trim() : undefined,
        fullNameAr: mode === "create" && fullNameAr.trim() ? fullNameAr.trim() : undefined,
        email: mode === "create" && email.trim() ? email.trim() : undefined,
        phone: mode === "create" && phone.trim() ? phone.trim() : undefined,
        primaryAccountId: resolvedAccountId,
        jobTitleSnapshot: jobTitleSnapshot.trim() || undefined,
        departmentName: departmentName.trim() || undefined,
        commercialNotes: commercialNotes.trim() || undefined,
      },
      customFields,
    );
    if (ok) resetForm();
  };

  const activeError = validationError || error;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl bg-nx-surface border-nx-line text-nx-ink max-h-[90vh] overflow-y-auto" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-nx-ink">
            <User className="size-4 text-nx-accent" />
            <span>{t("crmContacts.create.title") || "Register Commercial Contact"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-2">
            {t("crmContacts.create.description") || "Create a new contact stakeholder or link an existing person and assign their commercial account."}
          </DialogDescription>
        </DialogHeader>

        {activeError && (
          <Alert variant="destructive" className="py-2.5 border-destructive/20 bg-destructive/10">
            <AlertCircle className="size-4" />
            <AlertTitle className="text-xs font-semibold">{t("common.error") || "Validation Error"}</AlertTitle>
            <AlertDescription className="text-xs">{activeError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-nx-md bg-nx-raised border border-nx-line">
            <Button type="button" variant={mode === "create" ? "default" : "ghost"} size="sm" onClick={() => { setMode("create"); setValidationError(null); }} className="h-8 text-xs font-semibold gap-1.5">
              <PlusCircle className="size-3.5" />
              <span>{t("crmContacts.create.modeCreateNew") || "New Contact Person"}</span>
            </Button>
            <Button type="button" variant={mode === "select" ? "default" : "ghost"} size="sm" onClick={() => { setMode("select"); setValidationError(null); }} className="h-8 text-xs font-semibold gap-1.5">
              <User className="size-3.5" />
              <span>{t("crmContacts.create.modeSelectExisting") || "Existing Person"}</span>
            </Button>
          </div>

          {mode === "create" ? (
            <div className="space-y-3 rounded-nx-md border border-nx-line bg-nx-ground/40 p-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink">
                    {t("crmContacts.create.fullNameEn") || "Full Name (English)"} <span className="text-destructive">*</span>
                  </Label>
                  <Input value={fullNameEn} onChange={(e) => setFullNameEn(e.target.value)} placeholder="e.g. Tariq Al-Dosari" disabled={isSubmitting} className="h-9 text-xs bg-nx-surface border-nx-line" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink">{t("crmContacts.create.fullNameAr") || "Full Name (Arabic)"}</Label>
                  <Input value={fullNameAr} onChange={(e) => setFullNameAr(e.target.value)} placeholder="مثال: طارق الدوسري" disabled={isSubmitting} dir="rtl" className="h-9 text-xs bg-nx-surface border-nx-line" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink">{t("crmContacts.create.email") || "Direct Email"}</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tariq@organization.sa" disabled={isSubmitting} className="h-9 text-xs bg-nx-surface border-nx-line" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink">{t("crmContacts.create.phone") || "Mobile / Direct Phone"}</Label>
                  <PhoneInput value={phone} onChange={(val) => setPhone(val)} defaultCountry="SA" disabled={isSubmitting} placeholder="5X XXX XXXX" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 rounded-nx-md border border-nx-line bg-nx-ground/40 p-3.5">
              <Label className="text-xs font-medium text-nx-ink">
                {t("crmContacts.create.selectPerson") || "Select Person from Directory"} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3 pointer-events-none" />
                <Input value={personSearch} onChange={(e) => setPersonSearch(e.target.value)} placeholder={t("crmContacts.create.searchPeople") || "Filter people by name..."} disabled={isSubmitting} className="h-8 ps-8 text-xs bg-nx-surface border-nx-line mb-2" />
              </div>
              <Select value={personPartyId} onValueChange={setPersonPartyId} disabled={isSubmitting}>
                <SelectTrigger className="h-9 text-xs bg-nx-surface border-nx-line">
                  <SelectValue placeholder={t("crmContacts.create.choosePerson") || "Choose a person from directory..."} />
                </SelectTrigger>
                <SelectContent>
                  {candidatePeople.length === 0 ? (
                    <SelectItem value="__empty" disabled>{t("crmContacts.create.noPeopleFound") || "No matching people found — switch to 'New Contact Person'"}</SelectItem>
                  ) : (
                    candidatePeople.map((person) => (
                      <SelectItem key={person.partyId} value={person.partyId}>
                        {person.legalNameEn}{person.legalNameAr ? ` — ${person.legalNameAr}` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="contact-account-id" className="text-xs font-medium text-nx-ink flex items-center gap-1.5">
              <Building2 className="size-3.5 text-nx-accent" />
              <span>{t("crmContacts.create.primaryAccountId") || "Primary Commercial Account (Optional)"}</span>
            </Label>
            <Select value={primaryAccountId} onValueChange={setPrimaryAccountId} disabled={isSubmitting}>
              <SelectTrigger id="contact-account-id" className="h-9 text-xs bg-nx-surface border-nx-line">
                <SelectValue placeholder={t("crmContacts.create.selectPrimaryAccount") || "Select an account organization..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">{t("crmContacts.table.noAccount") || "Unassigned / Independent Contact"}</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {language === "ar" && acc.partyLegalNameAr ? acc.partyLegalNameAr : acc.partyLegalNameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="contact-job-title" className="text-xs font-medium text-nx-ink">{t("crmContacts.create.jobTitle") || "Job Title"}</Label>
              <Input id="contact-job-title" value={jobTitleSnapshot} onChange={(e) => setJobTitleSnapshot(e.target.value)} placeholder="e.g. Academy Director" disabled={isSubmitting} className="h-9 text-xs bg-nx-surface border-nx-line" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-department" className="text-xs font-medium text-nx-ink">{t("crmContacts.create.department") || "Department"}</Label>
              <Input id="contact-department" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} placeholder="e.g. Sports Operations" disabled={isSubmitting} className="h-9 text-xs bg-nx-surface border-nx-line" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-notes" className="text-xs font-medium text-nx-ink">{t("crmContacts.create.notes") || "Commercial Context & Notes"}</Label>
            <Textarea id="contact-notes" rows={3} value={commercialNotes} onChange={(e) => setCommercialNotes(e.target.value)} placeholder={t("crmContacts.create.notesPlaceholder") || "Key decision maker for sponsorships, preferred communication hours..."} disabled={isSubmitting} className="text-xs bg-nx-surface border-nx-line resize-none" />
          </div>

          <CustomFieldsSection
            entityTypeKey="crm.contact"
            entityDisplayName={t("crmContacts.title") || "Commercial Contact"}
            values={customFields}
            onChange={(key, value) => setCustomFields((prev) => ({ ...prev, [key]: value }))}
            disabled={isSubmitting}
          />

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)} disabled={isSubmitting} className="text-xs border-nx-line bg-nx-surface text-nx-ink">
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs font-bold">
              {isSubmitting ? t("common.saving") || "Saving..." : t("crmContacts.create.submit") || "Create Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
