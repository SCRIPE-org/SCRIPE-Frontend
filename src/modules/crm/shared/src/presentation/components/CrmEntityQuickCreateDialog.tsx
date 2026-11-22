"use client";

import { useEffect, useState } from "react";
import { stripHtmlTags } from "@core/common/sanitize";
import { useI18n } from "@core/providers/i18n-provider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { CrmQuickCreateEntityInput } from "../../types/crmSharedTypes";

/** Initial field prefill values for inline quick creation. */
export interface CrmEntityQuickCreateInitialValues {
  nameEn?: string;
  nameAr?: string;
  accountNameEn?: string;
  contactNameEn?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
}

/** Props for `CrmEntityQuickCreateDialog`. */
export interface CrmEntityQuickCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityKind: "party" | "account" | "contact";
  defaultSubKind?: "account" | "contact";
  primaryAccountId?: string;
  initialValues?: CrmEntityQuickCreateInitialValues;
  isSubmitting?: boolean;
  onSubmit: (input: CrmQuickCreateEntityInput) => Promise<void>;
}

/** Inline modal for creating an Account or Contact directly from any searchable CRM combobox. */
export function CrmEntityQuickCreateDialog({
  open,
  onOpenChange,
  entityKind,
  defaultSubKind = "contact",
  primaryAccountId,
  initialValues,
  isSubmitting = false,
  onSubmit,
}: CrmEntityQuickCreateDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const [subKind, setSubKind] = useState<"account" | "contact">(
    entityKind === "account" ? "account" : entityKind === "contact" ? "contact" : defaultSubKind
  );
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const initialAccountName = (initialValues?.accountNameEn ?? "").trim();
  const initialContactName = (initialValues?.contactNameEn ?? "").trim();
  const initialNameEn = (initialValues?.nameEn ?? "").trim();
  const initialNameAr = (initialValues?.nameAr ?? "").trim();
  const initialEmail = (initialValues?.email ?? "").trim();
  const initialPhone = (initialValues?.phone ?? "").trim();
  const initialJobTitle = (initialValues?.jobTitle ?? "").trim();

  useEffect(() => {
    if (!open) return;
    const initialKind: "account" | "contact" =
      entityKind === "account" ? "account" : entityKind === "contact" ? "contact" : defaultSubKind;
    const autoName = ((initialKind === "account" ? initialAccountName : initialContactName) || initialNameEn).trim();
    setSubKind(initialKind);
    setNameEn(autoName);
    setNameAr(initialNameAr);
    setEmail(initialEmail);
    setPhone(initialPhone);
    setJobTitle(initialJobTitle);
    setErrorMsg(null);
  }, [
    open,
    entityKind,
    defaultSubKind,
    initialAccountName,
    initialContactName,
    initialNameEn,
    initialNameAr,
    initialEmail,
    initialPhone,
    initialJobTitle,
  ]);

  const handleSubKindChange = (v: string) => {
    const nextKind: "account" | "contact" = v === "account" ? "account" : "contact";
    const prevAutoName = ((subKind === "account" ? initialAccountName : initialContactName) || initialNameEn).trim();
    const nextAutoName = ((nextKind === "account" ? initialAccountName : initialContactName) || initialNameEn).trim();
    setSubKind(nextKind);
    if ((!nameEn.trim() || nameEn.trim() === prevAutoName) && nextAutoName) {
      setNameEn(nextAutoName);
    }
  };

  const effectiveKind = entityKind === "party" ? subKind : entityKind;
  const dialogTitle =
    entityKind === "account"
      ? t("crm.entitySearch.quickCreateTitleAccount")
      : entityKind === "contact"
        ? t("crm.entitySearch.quickCreateTitleContact")
        : t("crm.entitySearch.quickCreateTitleParty");

  const handleSave = async () => {
    const cleanNameEn = stripHtmlTags(nameEn).trim();
    if (!cleanNameEn) {
      setErrorMsg(t("crm.entitySearch.nameEnRequired"));
      return;
    }
    setErrorMsg(null);
    try {
      await onSubmit({
        kind: entityKind,
        entitySubKind: entityKind === "party" ? subKind : undefined,
        nameEn: cleanNameEn,
        nameAr: stripHtmlTags(nameAr).trim() || undefined,
        email: stripHtmlTags(email).trim() || undefined,
        phone: stripHtmlTags(phone).trim() || undefined,
        jobTitle: effectiveKind === "contact" ? stripHtmlTags(jobTitle).trim() || undefined : undefined,
        primaryAccountId: effectiveKind === "contact" ? primaryAccountId || undefined : undefined,
      });
    } catch (err) {
      setErrorMsg((err instanceof Error ? err.message : "") || t("crm.entitySearch.createFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-nx-surface border-nx-line text-nx-ink" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-nx-ink">{dialogTitle}</DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-2">
            {t("crm.entitySearch.quickCreateSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {entityKind === "party" && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-nx-ink">{t("crm.entitySearch.recordTypeLabel")}</Label>
              <Select value={subKind} onValueChange={handleSubKindChange}>
                <SelectTrigger data-testid="crm-quick-create-kind" className="h-8 text-xs border-nx-line bg-nx-ground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contact" className="text-xs">{t("crm.entitySearch.recordTypeContact")}</SelectItem>
                  <SelectItem value="account" className="text-xs">{t("crm.entitySearch.recordTypeAccount")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-nx-ink">
              {t("crm.entitySearch.nameEnLabel")} <span className="text-destructive">*</span>
            </Label>
            <Input
              data-testid="crm-quick-create-name-en"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder={t("crm.entitySearch.nameEnPlaceholder")}
              className="h-8 text-xs border-nx-line bg-nx-ground"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-nx-ink">{t("crm.entitySearch.nameArLabel")}</Label>
            <Input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder={t("crm.entitySearch.nameArPlaceholder")}
              className="h-8 text-xs border-nx-line bg-nx-ground"
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-nx-ink">{t("crm.entitySearch.emailLabel")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("crm.entitySearch.emailPlaceholder")}
                className="h-8 text-xs border-nx-line bg-nx-ground"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-nx-ink">{t("crm.entitySearch.phoneLabel")}</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("crm.entitySearch.phonePlaceholder")}
                className="h-8 text-xs border-nx-line bg-nx-ground"
              />
            </div>
          </div>

          {effectiveKind === "contact" && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-nx-ink">{t("crm.entitySearch.jobTitleLabel")}</Label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder={t("crm.entitySearch.jobTitlePlaceholder")}
                className="h-8 text-xs border-nx-line bg-nx-ground"
              />
            </div>
          )}

          {errorMsg && <p className="text-[11px] font-medium text-destructive">{errorMsg}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="text-xs border-nx-line">
            {t("crm.actions.cancel")}
          </Button>
          <Button type="button" variant="default" size="sm" onClick={handleSave} disabled={isSubmitting} data-testid="crm-quick-create-submit" className="text-xs font-semibold">
            {isSubmitting ? t("crm.entitySearch.creatingBtn") : t("crm.entitySearch.createAndSelectBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
