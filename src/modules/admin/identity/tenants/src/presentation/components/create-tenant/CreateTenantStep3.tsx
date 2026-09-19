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
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import { CreditCard, AlertTriangle, ShieldCheck } from "lucide-react";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";
import { CreateTenantPromoField } from "./CreateTenantPromoField";
import { CreateTenantSummary } from "./CreateTenantSummary";

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
  const isFreeEdition = vm.selectedEdition?.isFree === true;

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
      Monthly: t("tenant.subscriptionTypes.monthly"),
      Yearly: t("tenant.subscriptionTypes.yearly"),
      Lifetime: t("tenant.subscriptionTypes.lifetime"),
      Trial: t("tenant.subscriptionTypes.trial"),
    };
    return vm.enabledSubscriptionTypes.map((st) => ({
      value: st.value,
      label: labelMap[st.value] || st.value,
    }));
  }, [vm.enabledSubscriptionTypes, t]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-warning/10">
          <CreditCard className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t("tenant.stepPlan")}</h2>
          <p className="text-sm text-nx-ink-2">
            {t("tenant.stepPlanDesc")}
          </p>
        </div>
      </div>

      {/* Edition — searchable GenericSelect with server search */}
      <div className="space-y-2">
        <Label>
          {t("tenant.edition")} <span className="text-destructive">*</span>
        </Label>
        <GenericSelect
          type="searchable"
          searchType="server"
          options={editionOptions}
          value={vm.form.editionId}
          onValueChange={(v: string | string[]) => vm.updateField("editionId", v as string)}
          onServerSearch={handleEditionSearch}
          placeholder={t("tenant.searchEditions")}
          searchPlaceholder={t("tenant.searchEditions")}
          noResultsText={t("common.noResults")}
        />
        {vm.stepTouched[3] && vm.stepErrors[3]?.includes("editionId") && (
          <p className="text-xs text-destructive">
            {t("tenant.editionRequired")}
          </p>
        )}
      </div>

      {/* Free Edition Banner */}
      {vm.form.editionId && isFreeEdition && (
        <div className="flex items-start gap-3 rounded-nx-md border border-success/30 bg-success/5 p-4 duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0 motion-safe:slide-in-from-bottom-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md bg-success/10">
            <ShieldCheck className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-sm font-medium text-success">
              {t("tenant.freeEditionSelected")}
            </p>
            <p className="mt-0.5 text-xs text-nx-ink-2">
              {t("tenant.freeEditionDesc")}
            </p>
          </div>
        </div>
      )}

      {/* Subscription Type & Currency */}
      {vm.form.editionId && subscriptionTypeOptions.length > 0 && (
        <div className="grid gap-5 duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0 motion-safe:slide-in-from-bottom-2 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("tenant.subscriptionType")}</Label>
            <GenericSelect
              options={subscriptionTypeOptions}
              value={vm.form.subscriptionType}
              onValueChange={(v: string | string[]) =>
                vm.updateField("subscriptionType", v as string)
              }
              placeholder={t("tenant.selectSubscriptionType")}
            />
            {subscriptionTypeOptions.length === 0 && (
              <p className="text-xs text-destructive">
                {t("tenant.noSubscriptionTypesAvailable")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("tenant.currency")}</Label>
            <GenericSelect
              type="searchable"
              options={CURRENCY_OPTIONS}
              value={vm.form.currency}
              onValueChange={(v: string | string[]) => vm.updateField("currency", v as string)}
              placeholder={t("tenant.selectCurrency")}
              searchPlaceholder={t("tenant.searchCurrencies")}
            />
          </div>
        </div>
      )}

      {/* Promo Code & Chips */}
      {vm.form.editionId && subscriptionTypeOptions.length > 0 && (
        <CreateTenantPromoField vm={vm} t={t} />
      )}

      {/* Skip Payment Toggle */}
      {vm.form.editionId && !isFreeEdition && subscriptionTypeOptions.length > 0 && (
        <div className="duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0 motion-safe:slide-in-from-bottom-2">
          <div className="flex items-center justify-between rounded-nx-md border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <p>{t("tenant.skipPayment")}</p>
                <p className="mt-0.5 text-xs text-nx-ink-2">
                  {t("tenant.skipPaymentDesc")}
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

      {/* Plan-Governed Permissions Banner */}
      <div className="flex items-start gap-3 rounded-nx-md border border-primary/20 bg-primary/5 p-4 duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0 motion-safe:slide-in-from-bottom-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-nx-ink-1">
            {t("tenant.editionGovernanceTitle")}
          </p>
          <p className="mt-1 text-xs text-nx-ink-2 leading-relaxed">
            {t("tenant.editionGovernanceDesc")}
          </p>
        </div>
      </div>

      {/* Summary */}
      {vm.form.editionId && <CreateTenantSummary vm={vm} t={t} />}
    </div>
  );
}
