"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { PhoneInput } from "@core/ui/phone-input";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@core/ui/dialog";
import { AlertCircle, Building2, PlusCircle } from "lucide-react";
import { CustomFieldsSection } from "@core/crud/customFieldsExtension";
import { CRM_CURRENCY_OPTIONS, CrmEntitySearchSelect } from "@modules/crm";
import type { CreateAccountInput, CrmCandidatePartyLookup } from "../../domain/entities/AccountEntity";

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateAccountInput, customFieldValues?: Record<string, unknown>) => Promise<boolean>;
  onLookupOrganizations?: (search?: string) => Promise<CrmCandidatePartyLookup[]>;
  isSubmitting: boolean;
  error: string | null;
}

export function CreateAccountDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  error,
}: CreateAccountDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [mode, setMode] = useState<"create" | "select">("create");
  const [partyId, setPartyId] = useState("");
  const [organizationNameEn, setOrganizationNameEn] = useState("");
  const [organizationNameAr, setOrganizationNameAr] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [commercialTierCode, setCommercialTierCode] = useState("Standard");
  const [preferredCurrencyCode, setPreferredCurrencyCode] = useState("SAR");
  const [commercialNotes, setCommercialNotes] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetForm = () => {
    setMode("create");
    setPartyId("");
    setOrganizationNameEn("");
    setOrganizationNameAr("");
    setEmail("");
    setPhone("");
    setCommercialTierCode("Standard");
    setPreferredCurrencyCode("SAR");
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
    if (mode === "select" && !partyId.trim()) {
      setValidationError(t("crmAccounts.create.organizationSelectRequired"));
      return;
    }
    if (mode === "create" && !organizationNameEn.trim()) {
      setValidationError(t("crmAccounts.create.organizationNameRequired"));
      return;
    }
    const ok = await onSubmit(
      {
        partyId: mode === "select" ? partyId.trim() : undefined,
        organizationNameEn: mode === "create" ? organizationNameEn.trim() : undefined,
        organizationNameAr: mode === "create" && organizationNameAr.trim() ? organizationNameAr.trim() : undefined,
        email: mode === "create" && email.trim() ? email.trim() : undefined,
        phone: mode === "create" && phone.trim() ? phone.trim() : undefined,
        commercialTierCode,
        preferredCurrencyCode: preferredCurrencyCode.trim() || "SAR",
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
            <Building2 className="size-4 text-nx-accent" />
            <span>{t("crmAccounts.create.title")}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-2">
            {t("crmAccounts.create.description")}
          </DialogDescription>
        </DialogHeader>

        {activeError && (
          <Alert variant="destructive" className="py-2.5 border-destructive/20 bg-destructive/10">
            <AlertCircle className="size-4" />
            <AlertTitle className="text-xs font-semibold">{t("crmAccounts.actions.error")}</AlertTitle>
            <AlertDescription className="text-xs">{activeError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-nx-md bg-nx-raised border border-nx-line">
            <Button type="button" variant={mode === "create" ? "default" : "ghost"} size="sm" onClick={() => { setMode("create"); setValidationError(null); }} className="h-8 text-xs font-semibold gap-1.5">
              <PlusCircle className="size-3.5" />
              <span>{t("crmAccounts.create.modeCreateNew")}</span>
            </Button>
            <Button type="button" variant={mode === "select" ? "default" : "ghost"} size="sm" onClick={() => { setMode("select"); setValidationError(null); }} className="h-8 text-xs font-semibold gap-1.5">
              <Building2 className="size-3.5" />
              <span>{t("crmAccounts.create.modeSelectExisting")}</span>
            </Button>
          </div>

          {mode === "create" ? (
            <div className="space-y-3 rounded-nx-md border border-nx-line bg-nx-ground/40 p-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink">
                    {t("crmAccounts.create.organizationNameEn")} <span className="text-destructive">*</span>
                  </Label>
                  <Input value={organizationNameEn} onChange={(e) => setOrganizationNameEn(e.target.value)} placeholder={t("crmAccounts.create.organizationNameEnPlaceholder")} disabled={isSubmitting} className="h-9 text-xs bg-nx-surface border-nx-line" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink">{t("crmAccounts.create.organizationNameAr")}</Label>
                  <Input value={organizationNameAr} onChange={(e) => setOrganizationNameAr(e.target.value)} placeholder={t("crmAccounts.create.organizationNameArPlaceholder")} disabled={isSubmitting} dir="rtl" className="h-9 text-xs bg-nx-surface border-nx-line" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink">{t("crmAccounts.create.email")}</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("crmAccounts.create.emailPlaceholder")} disabled={isSubmitting} className="h-9 text-xs bg-nx-surface border-nx-line" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink">{t("crmAccounts.create.phone")}</Label>
                  <PhoneInput value={phone} onChange={(val) => setPhone(val)} defaultCountry="SA" disabled={isSubmitting} placeholder={t("crmAccounts.create.phonePlaceholder")} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 rounded-nx-md border border-nx-line bg-nx-ground/40 p-3.5">
              <Label className="text-xs font-medium text-nx-ink">
                {t("crmAccounts.create.selectOrganization")} <span className="text-destructive">*</span>
              </Label>
              <CrmEntitySearchSelect
                id="account-org-select"
                entityKind="party"
                value={partyId}
                onChange={(val) => setPartyId(val)}
                placeholder={t("crmAccounts.create.chooseOrganization")}
                allowClear
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="account-tier" className="text-xs font-medium text-nx-ink">{t("crmAccounts.create.tier")}</Label>
              <Select value={commercialTierCode} onValueChange={setCommercialTierCode} disabled={isSubmitting}>
                <SelectTrigger id="account-tier" className="h-9 text-xs bg-nx-surface border-nx-line"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">{t("crmAccounts.tiers.Standard")}</SelectItem>
                  <SelectItem value="Strategic">{t("crmAccounts.tiers.Strategic")}</SelectItem>
                  <SelectItem value="KeyAccount">{t("crmAccounts.tiers.KeyAccount")}</SelectItem>
                  <SelectItem value="Enterprise">{t("crmAccounts.tiers.Enterprise")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account-currency" className="text-xs font-medium text-nx-ink">{t("crmAccounts.create.currency")}</Label>
              <Select value={preferredCurrencyCode} onValueChange={setPreferredCurrencyCode} disabled={isSubmitting}>
                <SelectTrigger id="account-currency" className="h-9 text-xs bg-nx-surface border-nx-line"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CRM_CURRENCY_OPTIONS.map((curr) => {
                    const labelKey = `crmAccounts.currencies.${curr.code}`;
                    const translated = t(labelKey);
                    const display = translated && translated !== labelKey ? translated : `${curr.code} — ${curr.nameEn}`;
                    return (
                      <SelectItem key={curr.code} value={curr.code}>
                        {display}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account-notes" className="text-xs font-medium text-nx-ink">{t("crmAccounts.create.notes")}</Label>
            <Textarea id="account-notes" rows={3} value={commercialNotes} onChange={(e) => setCommercialNotes(e.target.value)} placeholder={t("crmAccounts.create.notesPlaceholder")} disabled={isSubmitting} className="text-xs bg-nx-surface border-nx-line resize-none" />
          </div>

          <CustomFieldsSection
            entityTypeKey="crm.account"
            entityDisplayName={t("crmAccounts.title")}
            values={customFields}
            onChange={(key, value) => setCustomFields((prev) => ({ ...prev, [key]: value }))}
            disabled={isSubmitting}
          />

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)} disabled={isSubmitting} className="text-xs border-nx-line bg-nx-surface text-nx-ink">
              {t("crmAccounts.actions.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs font-bold">
              {isSubmitting ? t("crmAccounts.actions.saving") : t("crmAccounts.create.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
