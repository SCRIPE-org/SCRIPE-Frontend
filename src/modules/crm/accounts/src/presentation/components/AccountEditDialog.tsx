"use client";

import { useState, useEffect } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Alert, AlertDescription } from "@core/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { AlertCircle } from "lucide-react";
import { CRM_CURRENCY_OPTIONS } from "@modules/crm";

interface AccountEditDialogProps {
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly submitError: string | null;
  readonly baseCurrency: string;
  readonly initialTier: string;
  readonly initialCurrency: string;
  readonly initialNotes: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSave: (data: {
    commercialTierCode?: string;
    preferredCurrencyCode?: string;
    commercialNotes?: string;
  }) => Promise<void>;
  readonly isRtl: boolean;
  readonly t: (key: string) => string;
}

/** Modal dialog for editing a CRM Account's tier, preferred currency, and notes. */
export function AccountEditDialog({
  isOpen,
  isSubmitting,
  submitError,
  baseCurrency,
  initialTier,
  initialCurrency,
  initialNotes,
  onOpenChange,
  onSave,
  isRtl,
  t,
}: AccountEditDialogProps) {
  const [tier, setTier] = useState(initialTier || "Standard");
  const [currency, setCurrency] = useState(initialCurrency || baseCurrency || "SAR");
  const [notes, setNotes] = useState(initialNotes || "");

  useEffect(() => {
    if (isOpen) {
      setTier(initialTier || "Standard");
      setCurrency(initialCurrency || baseCurrency || "SAR");
      setNotes(initialNotes || "");
    }
  }, [isOpen, initialTier, initialCurrency, initialNotes, baseCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      commercialTierCode: tier.trim() || undefined,
      preferredCurrencyCode: currency.trim() || undefined,
      commercialNotes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-nx-surface border-nx-line text-nx-ink" dir={isRtl ? "rtl" : "ltr"}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink font-heading">
              {t("crmAccounts.edit.title")}
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("crmAccounts.edit.description")}
            </DialogDescription>
          </DialogHeader>

          {submitError && (
            <Alert variant="destructive" className="my-3 border-destructive/20 bg-destructive/10 text-destructive text-xs py-2">
              <AlertCircle className="size-3.5" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3.5 py-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-account-tier" className="text-nx-ink-2 font-medium">
                  {t("crmAccounts.create.tier")}
                </Label>
                <Select value={tier || "Standard"} onValueChange={setTier}>
                  <SelectTrigger id="edit-account-tier" className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enterprise">{t("crmAccounts.tiers.Enterprise")}</SelectItem>
                    <SelectItem value="MidMarket">{t("crmAccounts.tiers.MidMarket")}</SelectItem>
                    <SelectItem value="Standard">{t("crmAccounts.tiers.Standard")}</SelectItem>
                    <SelectItem value="Trial">{t("crmAccounts.tiers.Trial")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-account-currency" className="text-nx-ink-2 font-medium">
                  {t("crmAccounts.create.currency")}
                </Label>
                <Select value={currency || baseCurrency || "SAR"} onValueChange={setCurrency}>
                  <SelectTrigger id="edit-account-currency" className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CRM_CURRENCY_OPTIONS.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {t(`crmAccounts.currencies.${c.code}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-account-notes" className="text-nx-ink-2 font-medium">
                {t("crmAccounts.create.notes")}
              </Label>
              <Input
                id="edit-account-notes"
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
              {t("crmAccounts.actions.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs font-bold">
              {isSubmitting ? t("crmAccounts.actions.saving") : t("crmAccounts.actions.saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
