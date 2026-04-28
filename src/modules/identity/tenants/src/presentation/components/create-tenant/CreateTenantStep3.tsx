/**
 * CreateTenantStep3 — Plan & Billing
 *
 * Collects: edition (server-searchable), subscription type, currency,
 * promo code, and skip-payment toggle.
 *
 * Uses GenericSelect from @core/crud for all dropdowns (architecture compliance).
 * Uses SUPPORTED_CURRENCIES from @core/constants instead of hardcoded list.
 * Subscription types are dynamically filtered by the selected edition's Allow* flags.
 *
 * @module tenants/presentation/components
 */
"use client";

import React, { useMemo, useCallback } from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import { CreditCard, AlertTriangle } from "lucide-react";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";

// ── Static options ──────────────────────────────────────────

const CURRENCY_OPTIONS: GenericSelectOption[] = SUPPORTED_CURRENCIES.map((c) => ({
  value: c.code,
  label: `${c.code} (${c.symbol})`,
  icon: <span className="text-base">{c.flag}</span>,
}));

// ── Component ───────────────────────────────────────────────

interface CreateTenantStep3Props {
  vm: CreateTenantVM;
  t: (key: string) => string;
}

export function CreateTenantStep3({ vm, t }: CreateTenantStep3Props) {
  const isFreeEdition = vm.selectedEdition && (vm.selectedEdition as any).isFree;

  // Server-side search handler for edition GenericSelect
  const handleEditionSearch = useCallback(
    async (query: string) => {
      const results = await vm.handleSearchEditions(query);
      return results.map((r) => ({ value: r.value, label: r.label }));
    },
    [vm]
  );

  // Edition options from cached editions
  const editionOptions: GenericSelectOption[] = useMemo(
    () => vm.cachedEditions.map((ed) => ({ value: ed.id, label: ed.name })),
    [vm.cachedEditions]
  );

  // Subscription type options — dynamically filtered by edition's Allow* flags
  const subscriptionTypeOptions: GenericSelectOption[] = useMemo(() => {
    const labelMap: Record<string, string> = {
      Monthly: t("tenant.subscriptionTypes.monthly") || "Monthly",
      Yearly: t("tenant.subscriptionTypes.yearly") || "Yearly",
      Lifetime: t("tenant.subscriptionTypes.lifetime") || "Lifetime",
      Trial: t("tenant.subscriptionTypes.trial") || "Trial (14 days)",
    };
    return vm.enabledSubscriptionTypes.map((st) => ({
      value: st.value,
      label: labelMap[st.value] || st.value,
    }));
  }, [vm.enabledSubscriptionTypes, t]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <CreditCard className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t("tenant.stepPlan") || "Plan & Billing"}</h2>
          <p className="text-sm text-muted-foreground">
            {t("tenant.stepPlanDesc") || "Choose an edition and configure billing. This step is optional."}
          </p>
        </div>
      </div>

      {/* Edition — searchable GenericSelect with server search */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("tenant.edition") || "Edition"}</Label>
        <GenericSelect
          type="searchable"
          searchType="server"
          options={editionOptions}
          value={vm.form.editionId}
          onValueChange={(v: string | string[]) => vm.updateField("editionId", v as string)}
          onServerSearch={handleEditionSearch}
          placeholder={t("tenant.searchEditions") || "Search editions..."}
          searchPlaceholder={t("tenant.searchEditions") || "Search editions..."}
          noResultsText={t("common.noResults") || "No editions found"}
        />
      </div>

      {/* Subscription Type & Currency — only shown after edition is selected */}
      {vm.form.editionId && (
        <div className="grid gap-5 sm:grid-cols-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {/* Subscription Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("tenant.subscriptionType") || "Subscription Type"}</Label>
            <GenericSelect
              options={subscriptionTypeOptions}
              value={vm.form.subscriptionType}
              onValueChange={(v: string | string[]) => vm.updateField("subscriptionType", v as string)}
              placeholder={t("tenant.selectSubscriptionType") || "Select type..."}
            />
            {subscriptionTypeOptions.length === 0 && (
              <p className="text-xs text-destructive">
                {t("tenant.noSubscriptionTypesAvailable") || "No subscription types are enabled for this edition."}
              </p>
            )}
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("tenant.currency") || "Currency"}</Label>
            <GenericSelect
              type="searchable"
              options={CURRENCY_OPTIONS}
              value={vm.form.currency}
              onValueChange={(v: string | string[]) => vm.updateField("currency", v as string)}
              placeholder={t("tenant.selectCurrency") || "Select currency..."}
              searchPlaceholder={t("tenant.searchCurrencies") || "Search currencies..."}
            />
          </div>
        </div>
      )}

      {/* Promo Code */}
      {vm.form.editionId && (
        <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <Label className="text-sm font-medium">{t("tenant.promoCode") || "Promo Code"}</Label>
          <Input
            value={vm.form.promoCode}
            onChange={(e) => vm.updateField("promoCode", e.target.value)}
            placeholder={t("tenant.promoCodePlaceholder") || "Enter promotional code (optional)"}
            className="h-11 font-mono uppercase"
          />
          {vm.availablePromotions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {vm.availablePromotions.map((promo) => {
                const isSelected = vm.form.promotionId === promo.id;
                
                return (
                  <Badge
                    key={promo.id}
                    variant={isSelected ? "default" : "secondary"}
                    className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => {
                      if (isSelected) {
                        // Deselect — clear both fields atomically
                        vm.setForm((prev) => ({
                          ...prev,
                          promotionId: "",
                          promoCode: promo.code ? "" : prev.promoCode,
                        }));
                      } else {
                        // Select — set both fields atomically
                        vm.setForm((prev) => ({
                          ...prev,
                          promotionId: promo.id,
                          promoCode: promo.code || prev.promoCode,
                        }));
                      }
                    }}
                  >
                    {promo.name} ({promo.type === "Percentage" ? `${promo.discountValue}%` : `$${promo.discountValue}`})
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Skip Payment Toggle */}
      {vm.form.editionId && !isFreeEdition && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  {t("tenant.skipPayment") || "Skip Payment"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("tenant.skipPaymentDesc") || "Activates the subscription without payment processing. Use for demos or manual billing."}
                </p>
              </div>
            </div>
            <Switch
              checked={vm.form.skipPayment}
              onCheckedChange={(checked) => vm.updateField("skipPayment", checked)}
            />
          </div>
        </div>
      )}

      {/* Summary */}
      {vm.form.editionId && <CreateTenantSummary vm={vm} t={t} />}
    </div>
  );
}

// ── Inline Summary (co-located, only used here) ─────────────

function CreateTenantSummary({ vm, t }: { vm: CreateTenantVM; t: (key: string) => string }) {
  const subscriptionLabel = useMemo(() => {
    const map: Record<string, string> = {
      Monthly: t("tenant.subscriptionTypes.monthly") || "Monthly",
      Yearly: t("tenant.subscriptionTypes.yearly") || "Yearly",
      Lifetime: t("tenant.subscriptionTypes.lifetime") || "Lifetime",
      Trial: t("tenant.subscriptionTypes.trial") || "Trial",
    };
    return map[vm.form.subscriptionType] || vm.form.subscriptionType || "-";
  }, [vm.form.subscriptionType, t]);

  const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === vm.form.currency);
  const currencyLabel = currencyInfo ? `${currencyInfo.code} (${currencyInfo.symbol})` : vm.form.currency;

  return (
    <div className="rounded-xl bg-muted/30 border border-border/50 p-4 space-y-2 animate-in fade-in-0 duration-300">
      <h4 className="text-sm font-semibold mb-3">{t("tenant.summary") || "Summary"}</h4>
      <SummaryRow label={t("tenant.edition") || "Edition"} value={vm.selectedEdition?.name || "-"} />
      <SummaryRow label={t("tenant.subscriptionType") || "Billing"} value={subscriptionLabel} />
      <SummaryRow label={t("tenant.currency") || "Currency"} value={currencyLabel} />
      {vm.form.promotionId && (
        <SummaryRow 
          label={t("tenant.promotion") || "Promotion"} 
          value={vm.availablePromotions.find(p => p.id === vm.form.promotionId)?.name || vm.form.promoCode || "Applied"} 
          highlight 
        />
      )}
      {!vm.form.promotionId && vm.form.promoCode && (
        <SummaryRow 
          label={t("tenant.promotion") || "Promotion"} 
          value={vm.form.promoCode} 
          highlight 
        />
      )}
      {vm.form.skipPayment && (
        <SummaryRow
          label={t("tenant.payment") || "Payment"}
          value={t("tenant.skipped") || "Skipped (Admin Override)"}
          highlight
        />
      )}
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-medium text-amber-500" : "font-medium"}>{value}</span>
    </div>
  );
}
