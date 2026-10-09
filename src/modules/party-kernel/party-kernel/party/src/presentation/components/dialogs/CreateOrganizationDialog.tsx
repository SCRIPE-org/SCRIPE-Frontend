"use client";

import { useState } from "react";
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
import { useI18n } from "@core/providers/i18n-provider";
import { Building2, Phone, Mail, FileText, Loader2, Info } from "lucide-react";
import type { CreateOrganizationParams } from "../../../domain/interfaces/IPartyRepository";

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (params: CreateOrganizationParams) => Promise<string>;
  onSuccessNavigate?: (partyId: string) => void;
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  onSubmit,
  onSuccessNavigate,
}: CreateOrganizationDialogProps) {
  const { t } = useI18n();

  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setLegalName("");
    setDisplayName("");
    setTaxId("");
    setPhone("");
    setEmail("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedLegal = legalName.trim();
    if (!trimmedLegal) {
      setError(t("party.dialog.legalNameRequired") || "Legal Business Name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const partyId = await onSubmit({
        legalName: trimmedLegal,
        displayName: displayName.trim() || undefined,
        taxId: taxId.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });

      handleClose();
      if (onSuccessNavigate && partyId) {
        onSuccessNavigate(partyId);
      }
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : "Failed to create organization";
      if (
        rawMessage.includes("QuotaExceeded") ||
        rawMessage.includes("limit reached") ||
        rawMessage.includes("quota")
      ) {
        setError(
          t("party.errors.quotaExceeded") ||
            "Maximum party profiles limit reached for your tenant subscription. Contact your administrator."
        );
      } else {
        setError(rawMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{t("party.dialog.createOrgTitle")}</DialogTitle>
                <DialogDescription>
                  {t("party.dialog.createOrgDesc")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            {/* Legal Name */}
            <div className="grid gap-2">
              <Label htmlFor="org-legal-name" className="text-nx-ink font-medium">
                {t("party.dialog.legalName")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="org-legal-name"
                value={legalName}
                onChange={(e) => {
                  setLegalName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={t("party.dialog.legalNamePlaceholder")}
                disabled={isSubmitting}
                autoFocus
                required
              />
            </div>

            {/* Display / Commercial Name */}
            <div className="grid gap-2">
              <Label htmlFor="org-display-name" className="text-nx-ink font-medium">
                {t("party.dialog.displayName")}
              </Label>
              <Input
                id="org-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("party.dialog.displayNamePlaceholder")}
                disabled={isSubmitting}
              />
            </div>

            {/* Tax / CR Registration ID */}
            <div className="grid gap-2">
              <Label htmlFor="org-tax-id" className="text-nx-ink flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-nx-ink-3" />
                {t("party.dialog.taxId")}
              </Label>
              <Input
                id="org-tax-id"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder={t("party.dialog.taxIdPlaceholder")}
                disabled={isSubmitting}
              />
              <div className="flex items-start gap-1.5 text-xs text-nx-ink-3">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-nx-ink-3" />
                <span>{t("party.dialog.taxIdHelp")}</span>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="grid gap-2">
                <Label htmlFor="org-phone" className="text-nx-ink flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-nx-ink-3" />
                  {t("party.dialog.phone")}
                </Label>
                <Input
                  id="org-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("party.dialog.phonePlaceholder")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="org-email" className="text-nx-ink flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-nx-ink-3" />
                  {t("party.dialog.email")}
                </Label>
                <Input
                  id="org-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("party.dialog.emailPlaceholder")}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t("party.dialog.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || !legalName.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("party.dialog.create")}...
                </>
              ) : (
                t("party.dialog.create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
