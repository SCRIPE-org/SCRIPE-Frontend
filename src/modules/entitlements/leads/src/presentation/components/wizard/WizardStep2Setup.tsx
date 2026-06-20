"use client";

import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Switch } from "@core/ui/switch";
import { Package, BadgeDollarSign, AlertCircle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { EditionForConversion } from "../../../domain/interfaces/ILeadsRepository";
import type { PlatformLead } from "../../../domain/entities/PlatformLead";
import type { Step2State } from "../../viewmodels/useConvertWizardViewModel";

const CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED", "EGP"];

// ── Props ─────────────────────────────────────────────────────────────────────

interface WizardStep2Props {
  lead: PlatformLead | null;
  edition: EditionForConversion | null;
  state: Step2State;
  onChange: (s: Step2State) => void;
  amountError: string;
  onAmountChange: (val: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WizardStep2Setup({ lead, edition, state, onChange, amountError, onAmountChange }: WizardStep2Props) {
  const { t, language } = useI18n();
  const set = (field: keyof Step2State, value: string | boolean) =>
    onChange({ ...state, [field]: value });

  return (
    <div className="space-y-5">
      {/* Edition reminder */}
      {edition && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
          <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <span className="text-sm font-medium">
              {language === "ar" && edition.displayNameAr ? edition.displayNameAr : edition.displayNameEn}
            </span>
            {edition.isContactSalesOnly && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-500">
                {t("leads.convertWizard.customPricingRequired")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tenant Code */}
      <div className="space-y-1.5">
        <Label htmlFor="wiz-tenant-code">{t("leads.convertWizard.workspaceSlug")}</Label>
        <Input
          id="wiz-tenant-code"
          value={state.tenantCode}
          onChange={(e) => set("tenantCode", e.target.value)}
          placeholder={`e.g. ${lead?.companyName?.toLowerCase().replace(/\s+/g, "-") ?? "acme"}`}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">{t("leads.convertWizard.workspaceSlugHint")}</p>
      </div>

      {/* Admin Email */}
      <div className="space-y-1.5">
        <Label htmlFor="wiz-admin-email">{t("leads.convertWizard.adminEmail")}</Label>
        <Input
          id="wiz-admin-email"
          type="email"
          value={state.adminEmail}
          onChange={(e) => set("adminEmail", e.target.value)}
          placeholder={lead?.email ?? "admin@company.com"}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">{t("leads.convertWizard.adminEmailHint")}</p>
      </div>

      {/* Billing row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="wiz-sub-type">{t("leads.convertWizard.billingCycle")}</Label>
          <Select value={state.subscriptionType} onValueChange={(v) => set("subscriptionType", v)}>
            <SelectTrigger id="wiz-sub-type">
              <SelectValue placeholder={t("leads.convertWizard.editionDefault")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Monthly">{t("leads.convertDialog.subscriptionMonthly")}</SelectItem>
              <SelectItem value="Yearly">{t("leads.convertDialog.subscriptionYearly")}</SelectItem>
              <SelectItem value="Lifetime">{t("leads.convertDialog.subscriptionLifetime")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wiz-currency">{t("leads.convertDialog.currency")}</Label>
          <Select value={state.currency} onValueChange={(v) => onChange({ ...state, currency: v, negotiatedCurrency: v })}>
            <SelectTrigger id="wiz-currency"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Custom Deal Price */}
      <div className="space-y-3 rounded-xl border border-border bg-muted/30 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-medium leading-none">{t("leads.convertDialog.negotiatedPrice.toggle")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {edition?.isContactSalesOnly
                  ? t("leads.convertWizard.customPricingRequiredDesc")
                  : t("leads.convertWizard.customPricingDesc")}
              </p>
            </div>
          </div>
          {edition?.isContactSalesOnly ? (
            <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
              {t("leads.convertWizard.required")}
            </span>
          ) : (
            <Switch
              id="wiz-custom-price"
              checked={state.useCustomPrice}
              onCheckedChange={(v) => {
                set("useCustomPrice", v);
                if (!v) onChange({ ...state, useCustomPrice: false, negotiatedAmount: "" });
              }}
            />
          )}
        </div>
        {state.useCustomPrice && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="wiz-neg-amount">{t("leads.convertWizard.negotiatedAmount")} ({state.currency})</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-semibold text-muted-foreground">
                  {state.currency}
                </span>
                <Input
                  id="wiz-neg-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={state.negotiatedAmount}
                  onChange={(e) => onAmountChange(e.target.value)}
                  placeholder="0.00"
                  className={`pl-12 ${amountError ? "border-destructive" : ""}`}
                />
              </div>
              {amountError && <p className="text-xs text-destructive">{amountError}</p>}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {t("leads.convertDialog.negotiatedPrice.warning")}
            </p>
          </div>
        )}
      </div>

      {/* Conversion Note */}
      <div className="space-y-1.5">
        <Label htmlFor="wiz-note">{t("leads.convertWizard.internalNote")}</Label>
        <Textarea
          id="wiz-note"
          value={state.conversionNote}
          onChange={(e) => set("conversionNote", e.target.value)}
          placeholder={t("leads.convertWizard.internalNotePlaceholder")}
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  );
}
