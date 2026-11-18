"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import type { CrmQuickCreateEntityInput } from "../viewmodels/useCrmEntitySearchViewModel";

export interface CrmEntityQuickCreateInitialValues {
  nameEn?: string;
  nameAr?: string;
  accountNameEn?: string;
  contactNameEn?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
}

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

/**
 * Inline modal for creating an Account or Contact directly from any searchable CRM combobox.
 */
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

  const pickAutoName = (kind: "account" | "contact") =>
    (
      (kind === "account" ? initialValues?.accountNameEn : initialValues?.contactNameEn) ||
      initialValues?.nameEn ||
      ""
    ).trim();

  const [prevOpenKey, setPrevOpenKey] = useState("");
  const openKey = open
    ? `${entityKind}:${defaultSubKind}:${pickAutoName("account")}:${pickAutoName("contact")}:${initialValues?.nameAr ?? ""}:${initialValues?.email ?? ""}:${initialValues?.phone ?? ""}:${initialValues?.jobTitle ?? ""}`
    : "";
  if (openKey && openKey !== prevOpenKey) {
    const initialKind =
      entityKind === "account" ? "account" : entityKind === "contact" ? "contact" : defaultSubKind;
    setPrevOpenKey(openKey);
    setSubKind(initialKind);
    setNameEn(pickAutoName(initialKind));
    setNameAr((initialValues?.nameAr ?? "").trim());
    setEmail((initialValues?.email ?? "").trim());
    setPhone((initialValues?.phone ?? "").trim());
    setJobTitle((initialValues?.jobTitle ?? "").trim());
    setErrorMsg(null);
  } else if (!open && prevOpenKey !== "") {
    setPrevOpenKey("");
  }

  const handleSubKindChange = (v: string) => {
    const nextKind: "account" | "contact" = v === "account" ? "account" : "contact";
    const prevAutoName = pickAutoName(subKind);
    const nextAutoName = pickAutoName(nextKind);
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
    if (!nameEn.trim()) {
      setErrorMsg(t("crm.entitySearch.nameEnRequired"));
      return;
    }
    setErrorMsg(null);
    try {
      await onSubmit({
        kind: entityKind,
        entitySubKind: entityKind === "party" ? subKind : undefined,
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        jobTitle: effectiveKind === "contact" ? jobTitle.trim() || undefined : undefined,
        primaryAccountId: effectiveKind === "contact" ? primaryAccountId || undefined : undefined,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setErrorMsg(msg || t("crm.entitySearch.createFailed"));
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs border-nx-line"
          >
            {t("crm.transitionDialog.cancelBtn")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting}
            data-testid="crm-quick-create-submit"
            className="text-xs font-semibold bg-nx-accent-fill text-nx-on-fill hover:bg-nx-accent-fill/90"
          >
            {isSubmitting ? t("crm.entitySearch.creatingBtn") : t("crm.entitySearch.createAndSelectBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
