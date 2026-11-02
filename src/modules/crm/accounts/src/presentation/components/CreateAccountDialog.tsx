"use client";

import { useState } from "react";
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
import { AlertCircle, Building2 } from "lucide-react";
import type { CreateAccountInput } from "../../domain/entities/AccountEntity";

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateAccountInput) => Promise<boolean>;
  isSubmitting?: boolean;
  error?: string | null;
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

  const [partyId, setPartyId] = useState("");
  const [tierCode, setTierCode] = useState("Standard");
  const [currency, setCurrency] = useState("SAR");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId.trim()) {
      setValidationError(
        t("crmAccounts.create.partyRequired") || "Organization Party ID is required."
      );
      return;
    }
    setValidationError(null);

    const success = await onSubmit({
      partyId: partyId.trim(),
      commercialTierCode: tierCode.trim() || "Standard",
      preferredCurrencyCode: currency.trim() || "SAR",
      commercialNotes: notes.trim() || undefined,
    });

    if (success) {
      setPartyId("");
      setNotes("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-nx-surface border-nx-line text-nx-ink" dir={isRtl ? "rtl" : "ltr"}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
                <Building2 className="size-4 text-nx-accent" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-nx-ink font-heading">
                  {t("crmAccounts.create.title") || "Register Commercial Account"}
                </DialogTitle>
                <DialogDescription className="text-xs text-nx-ink-2">
                  {t("crmAccounts.create.description") ||
                    "Link an enterprise PartyKernel organization into the CRM commercial catalog."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {(validationError || error) && (
            <Alert variant="destructive" className="my-3 border-destructive/20 bg-destructive/10 text-destructive text-xs py-2">
              <AlertCircle className="size-3.5" />
              <AlertDescription>{validationError || error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3.5 py-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="account-partyId" className="text-nx-ink-2 font-medium">
                {t("crmAccounts.create.partyId") || "Organization Party ID / GUID"} *
              </Label>
              <Input
                id="account-partyId"
                placeholder="e.g. 7a110001-f40c-4df5-b1ba-760ce297b8d7"
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                required
                className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="account-tier" className="text-nx-ink-2 font-medium">
                  {t("crmAccounts.create.tier") || "Commercial Tier"}
                </Label>
                <Input
                  id="account-tier"
                  placeholder="e.g. Enterprise, KeyAccount"
                  value={tierCode}
                  onChange={(e) => setTierCode(e.target.value)}
                  className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account-currency" className="text-nx-ink-2 font-medium">
                  {t("crmAccounts.create.currency") || "Currency Code"}
                </Label>
                <Input
                  id="account-currency"
                  placeholder="SAR, EGP, USD"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink font-mono uppercase"
                  maxLength={5}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account-notes" className="text-nx-ink-2 font-medium">
                {t("crmAccounts.create.notes") || "Commercial Account Notes"}
              </Label>
              <Input
                id="account-notes"
                placeholder={t("crmAccounts.create.notesPlaceholder") || "Key strategic partnership notes..."}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-nx-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 text-xs border-nx-line text-nx-ink-2"
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs font-bold"
            >
              {isSubmitting
                ? t("common.saving") || "Saving..."
                : t("crmAccounts.create.submit") || "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
