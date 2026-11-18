"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { PhoneInput } from "@core/ui/phone-input";
import { Textarea } from "@core/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@core/ui/dialog";
import { AlertCircle, User, PlusCircle, Building2 } from "lucide-react";
import { CustomFieldsSection } from "@core/crud/customFieldsExtension";
import { CrmEntitySearchSelect } from "@modules/crm";
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

  useEffect(() => {
    if (open && defaultAccountId) {
      setPrimaryAccountId(defaultAccountId);
    }
  }, [open, defaultAccountId]);

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
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (mode === "select" && !personPartyId.trim()) {
      setValidationError(t("crmContacts.create.personSelectRequired"));
      return;
    }
    if (mode === "create" && !fullNameEn.trim()) {
      setValidationError(t("crmContacts.create.fullNameRequired"));
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
            <span>{t("crmContacts.create.title")}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-2">
            {t("crmContacts.create.description")}
          </DialogDescription>
        </DialogHeader>

        {activeError && (
          <Alert variant="destructive" className="py-2.5 border-destructive/20 bg-destructive/10">
            <AlertCircle className="size-4" />
            <AlertTitle className="text-xs font-semibold">{t("crmContacts.actions.error")}</AlertTitle>
            <AlertDescription className="text-xs">{activeError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-nx-md bg-nx-raised border border-nx-line">
            <Button type="button" variant={mode === "create" ? "default" : "ghost"} size="sm" onClick={() => { setMode("create"); setValidationError(null); }} className="h-8 text-xs font-semibold gap-1.5">
              <PlusCircle className="size-3.5" />
              <span>{t("crmContacts.create.modeCreateNew")}</span>
            </Button>
            <Button type="button" variant={mode === "select" ? "default" : "ghost"} size="sm" onClick={() => { setMode("select"); setValidationError(null); }} className="h-8 text-xs font-semibold gap-1.5">
              <User className="size-3.5" />
              <span>{t("crmContacts.create.modeSelectExisting")}</span>
            </Button>
          </div>

          {mode === "create" ? (
            <div className="space-y-3 rounded-nx-md border border-nx-line bg-nx-ground/40 p-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink">
                    {t("crmContacts.create.fullNameEn")} <span className="text-destructive">*</span>
                  </Label>
                  <Input value={fullNameEn} onChange={(e) => setFullNameEn(e.target.value)} placeholder={t("crmContacts.create.fullNameEnPlaceholder")} disabled={isSubmitting} className="h-9 text-xs bg-nx-surface border-nx-line" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink">{t("crmContacts.create.fullNameAr")}</Label>
                  <Input value={fullNameAr} onChange={(e) => setFullNameAr(e.target.value)} placeholder={t("crmContacts.create.fullNameArPlaceholder")} disabled={isSubmitting} dir="rtl" className="h-9 text-xs bg-nx-surface border-nx-line" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink">{t("crmContacts.create.email")}</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("crmContacts.create.emailPlaceholder")} disabled={isSubmitting} className="h-9 text-xs bg-nx-surface border-nx-line" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink">{t("crmContacts.create.phone")}</Label>
                  <PhoneInput value={phone} onChange={(val) => setPhone(val)} defaultCountry="SA" disabled={isSubmitting} placeholder={t("crmContacts.create.phonePlaceholder")} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 rounded-nx-md border border-nx-line bg-nx-ground/40 p-3.5">
              <Label className="text-xs font-medium text-nx-ink">
                {t("crmContacts.create.selectPerson")} <span className="text-destructive">*</span>
              </Label>
              <CrmEntitySearchSelect
                id="contact-person-select"
                entityKind="party"
                value={personPartyId}
                onChange={(val) => setPersonPartyId(val)}
                placeholder={t("crmContacts.create.choosePerson")}
                allowClear
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="contact-account-id" className="text-xs font-medium text-nx-ink flex items-center gap-1.5">
              <Building2 className="size-3.5 text-nx-accent" />
              <span>{t("crmContacts.create.primaryAccountId")}</span>
            </Label>
            <CrmEntitySearchSelect
              id="contact-account-id"
              entityKind="account"
              valueMode="id"
              value={primaryAccountId === "__none" ? "" : primaryAccountId}
              onChange={(val) => setPrimaryAccountId(val || "__none")}
              placeholder={t("crmContacts.create.selectPrimaryAccount")}
              enableQuickCreate
              quickCreateDefaultKind="account"
              allowClear
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="contact-job-title" className="text-xs font-medium text-nx-ink">{t("crmContacts.create.jobTitle")}</Label>
              <Input id="contact-job-title" value={jobTitleSnapshot} onChange={(e) => setJobTitleSnapshot(e.target.value)} placeholder={t("crmContacts.create.jobTitlePlaceholder")} disabled={isSubmitting} className="h-9 text-xs bg-nx-surface border-nx-line" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-department" className="text-xs font-medium text-nx-ink">{t("crmContacts.create.department")}</Label>
              <Input id="contact-department" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} placeholder={t("crmContacts.create.departmentPlaceholder")} disabled={isSubmitting} className="h-9 text-xs bg-nx-surface border-nx-line" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-notes" className="text-xs font-medium text-nx-ink">{t("crmContacts.create.notes")}</Label>
            <Textarea id="contact-notes" rows={3} value={commercialNotes} onChange={(e) => setCommercialNotes(e.target.value)} placeholder={t("crmContacts.create.notesPlaceholder")} disabled={isSubmitting} className="text-xs bg-nx-surface border-nx-line resize-none" />
          </div>

          <CustomFieldsSection
            entityTypeKey="crm.contact"
            entityDisplayName={t("crmContacts.title")}
            values={customFields}
            onChange={(key, value) => setCustomFields((prev) => ({ ...prev, [key]: value }))}
            disabled={isSubmitting}
          />

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)} disabled={isSubmitting} className="text-xs border-nx-line bg-nx-surface text-nx-ink">
              {t("crmContacts.actions.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs font-bold">
              {isSubmitting ? t("crmContacts.actions.saving") : t("crmContacts.create.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
