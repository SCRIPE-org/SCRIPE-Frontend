"use client";

import { useState } from "react";
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
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Switch } from "@core/ui/switch";
import { useI18n } from "@core/providers/i18n-provider";
import type { ConvertLeadParams } from "../../domain/interfaces/ILeadsRepository";
import type { PlatformLead } from "../../domain/entities/PlatformLead";
import { Loader2, ArrowRight, Building2, BadgeDollarSign } from "lucide-react";

// ── Props ─────────────────────────────────────────────────────────────────────

interface ConvertToTenantDialogProps {
  open: boolean;
  lead: PlatformLead | null;
  isConverting: boolean;
  onClose: () => void;
  onConvert: (params: ConvertLeadParams) => Promise<void>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ConvertToTenantDialog({
  open,
  lead,
  isConverting,
  onClose,
  onConvert,
}: ConvertToTenantDialogProps) {
  const { t } = useI18n();

  // ── Standard fields ───────────────────────────────────────────────────────
  const [tenantCode, setTenantCode] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [subscriptionType, setSubscriptionType] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [conversionNote, setConversionNote] = useState("");

  // ── Custom deal price (G7) ────────────────────────────────────────────────
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [negotiatedAmountRaw, setNegotiatedAmountRaw] = useState("");
  const [negotiatedCurrency, setNegotiatedCurrency] = useState("USD");

  // ── Validation ────────────────────────────────────────────────────────────
  const [amountError, setAmountError] = useState("");

  const validateAmount = (val: string): boolean => {
    if (!val.trim()) {
      setAmountError(t("leads.convertDialog.negotiatedPrice.amountRequired"));
      return false;
    }
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) {
      setAmountError(t("leads.convertDialog.negotiatedPrice.amountInvalid"));
      return false;
    }
    setAmountError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (useCustomPrice && !validateAmount(negotiatedAmountRaw)) return;

    const negotiatedAmount =
      useCustomPrice && negotiatedAmountRaw.trim() ? parseFloat(negotiatedAmountRaw) : undefined;

    await onConvert({
      tenantCode: tenantCode.trim() || undefined,
      adminEmail: adminEmail.trim() || undefined,
      subscriptionType: subscriptionType || undefined,
      currency: currency || undefined,
      conversionNote: conversionNote.trim() || undefined,
      negotiatedAmount,
      negotiatedCurrency: useCustomPrice ? negotiatedCurrency : undefined,
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isConverting) onClose();
  };

  const handleClose = () => {
    if (isConverting) return;
    // Reset all state
    setTenantCode("");
    setAdminEmail("");
    setSubscriptionType("");
    setCurrency("USD");
    setConversionNote("");
    setUseCustomPrice(false);
    setNegotiatedAmountRaw("");
    setNegotiatedCurrency("USD");
    setAmountError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle>{t("leads.convertDialog.title")}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {t("leads.convertDialog.subtitle")}
              </DialogDescription>
            </div>
          </div>
          {lead && (
            <div className="mt-2 rounded-lg border border-border bg-muted/50 px-4 py-3">
              <p className="text-sm font-medium">{lead.companyName}</p>
              <p className="text-xs text-muted-foreground">
                {lead.contactName} · {lead.email}
              </p>
              {lead.editionKey && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("leads.drawer.editionLabel").replace("{edition}", lead.editionKey)}
                </p>
              )}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Tenant Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="convert-tenant-code">{t("leads.convertDialog.tenantCode")}</Label>
            <Input
              id="convert-tenant-code"
              value={tenantCode}
              onChange={(e) => setTenantCode(e.target.value)}
              placeholder={t("leads.convertDialog.tenantCodePlaceholder")}
              disabled={isConverting}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              {t("leads.convertDialog.tenantCodeHint")}
            </p>
          </div>

          {/* Admin Email */}
          <div className="space-y-1.5">
            <Label htmlFor="convert-admin-email">{t("leads.convertDialog.adminEmail")}</Label>
            <Input
              id="convert-admin-email"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder={lead?.email ?? t("leads.convertDialog.adminEmailPlaceholder")}
              disabled={isConverting}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              {t("leads.convertDialog.adminEmailHint")}
            </p>
          </div>

          {/* Subscription Type + Currency row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="convert-sub-type">{t("leads.convertDialog.subscriptionType")}</Label>
              <Select
                value={subscriptionType}
                onValueChange={setSubscriptionType}
                disabled={isConverting}
              >
                <SelectTrigger id="convert-sub-type">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">
                    {t("leads.convertDialog.subscriptionMonthly")}
                  </SelectItem>
                  <SelectItem value="Yearly">
                    {t("leads.convertDialog.subscriptionYearly")}
                  </SelectItem>
                  <SelectItem value="Lifetime">
                    {t("leads.convertDialog.subscriptionLifetime")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="convert-currency">{t("leads.convertDialog.currency")}</Label>
              <Select value={currency} onValueChange={setCurrency} disabled={isConverting}>
                <SelectTrigger id="convert-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="EGP">EGP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Custom Deal Price (G7) ─────────────────────────────────── */}
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
            {/* Toggle row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-medium leading-none">
                    {t("leads.convertDialog.negotiatedPrice.toggle")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("leads.convertDialog.negotiatedPrice.toggleHint")}
                  </p>
                </div>
              </div>
              <Switch
                id="convert-custom-price"
                checked={useCustomPrice}
                onCheckedChange={(v) => {
                  setUseCustomPrice(v);
                  if (!v) {
                    setNegotiatedAmountRaw("");
                    setAmountError("");
                  }
                }}
                disabled={isConverting}
              />
            </div>

            {/* Amount + currency — shown only when toggled on */}
            {useCustomPrice && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="convert-negotiated-amount">
                    {t("leads.convertDialog.negotiatedPrice.amount")}
                  </Label>
                  <Input
                    id="convert-negotiated-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={negotiatedAmountRaw}
                    onChange={(e) => {
                      setNegotiatedAmountRaw(e.target.value);
                      if (amountError) validateAmount(e.target.value);
                    }}
                    placeholder="0.00"
                    disabled={isConverting}
                    autoComplete="off"
                    className={amountError ? "border-destructive" : ""}
                  />
                  {amountError && <p className="text-xs text-destructive">{amountError}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="convert-negotiated-currency">
                    {t("leads.convertDialog.negotiatedPrice.currency")}
                  </Label>
                  <Select
                    value={negotiatedCurrency}
                    onValueChange={setNegotiatedCurrency}
                    disabled={isConverting}
                  >
                    <SelectTrigger id="convert-negotiated-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="SAR">SAR</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
                      <SelectItem value="EGP">EGP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="col-span-2 text-xs text-amber-600 dark:text-amber-400">
                  {t("leads.convertDialog.negotiatedPrice.warning")}
                </p>
              </div>
            )}
          </div>

          {/* Conversion Note */}
          <div className="space-y-1.5">
            <Label htmlFor="convert-note">{t("leads.convertDialog.conversionNote")}</Label>
            <Textarea
              id="convert-note"
              value={conversionNote}
              onChange={(e) => setConversionNote(e.target.value)}
              placeholder={t("leads.convertDialog.conversionNotePlaceholder")}
              disabled={isConverting}
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isConverting}>
              {t("leads.convertDialog.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isConverting}
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("leads.convertDialog.converting")}
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  {t("leads.convertDialog.convert")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
