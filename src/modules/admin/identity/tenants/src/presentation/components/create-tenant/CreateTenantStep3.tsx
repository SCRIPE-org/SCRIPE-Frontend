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
import { Badge } from "@core/ui/badge";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import { CreditCard, AlertTriangle, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@core/common/utils";
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
  const selectedArchetype = vm.form.organizationType || "academy";
  const archetypeName = t(`tenant.types.${selectedArchetype}`);
  const isSportsOrg = ["academy", "venue", "club", "federation"].includes(selectedArchetype);

  // Server-side search handler for edition GenericSelect
  const handleEditionSearch = useCallback(
    async (query: string) => {
      const results = await vm.handleSearchEditions(query);
      return results.map((r) => ({ value: r.value, label: r.label }));
    },
    [vm]
  );

  // Derive recommended editions based on the chosen organization archetype
  const recommendedEditions = useMemo(() => {
    return vm.cachedEditions.filter((ed) => {
      const cat = ed.category?.toLowerCase();
      const name = ed.name.toLowerCase();
      if (isSportsOrg) {
        return (
          cat === "sports" ||
          name.includes("sport") ||
          name.includes("academy") ||
          name.includes("venue") ||
          name.includes("club")
        );
      }
      return false;
    });
  }, [vm.cachedEditions, isSportsOrg]);

  // Edition options from cached editions — recommended editions flagged with ⭐
  const editionOptions: GenericSelectOption[] = useMemo(() => {
    return vm.cachedEditions.map((ed) => {
      const isRec = recommendedEditions.some((r) => r.id === ed.id);
      return {
        value: ed.id,
        label: isRec ? `⭐ ${ed.name}` : ed.name,
      };
    });
  }, [vm.cachedEditions, recommendedEditions]);

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

      {/* Validation Error Banner */}
      {vm.stepTouched[3] && vm.stepErrors[3]?.length > 0 && (
        <div
          role="alert"
          className="rounded-nx-md border border-destructive/30 bg-destructive/10 p-3.5 text-destructive"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1 text-xs">
              <p className="font-semibold">{t("validation.correctErrorsTitle")}</p>
              <ul className="list-disc ps-4 space-y-0.5 text-[11px] text-destructive/90">
                {vm.stepErrors[3].includes("editionId") && <li>{t("tenant.editionRequired")}</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Smart Edition Recommendation Banner */}
      {isSportsOrg && (
        <div className="rounded-nx-lg border border-nx-accent/30 bg-nx-accent-wash/50 p-4 duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0 motion-safe:slide-in-from-bottom-2">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-nx-md bg-nx-accent/15 text-nx-accent">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold text-nx-ink-1">
                  {t("tenant.recommendedForArchetype").replace("{archetype}", archetypeName)}
                </p>
                <Badge variant="outline" className="border-nx-accent/40 bg-nx-accent/10 text-[10px] font-semibold text-nx-accent">
                  {t("tenant.recommendedEditions")}
                </Badge>
              </div>
              <p className="text-[11px] leading-relaxed text-nx-ink-2">
                {t("tenant.sportsArchetypeNotice")}
              </p>

              {/* Quick-select chips */}
              {recommendedEditions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-1">
                  {recommendedEditions.slice(0, 4).map((ed) => {
                    const isSelected = vm.form.editionId === ed.id;
                    return (
                      <button
                        key={ed.id}
                        type="button"
                        onClick={() => vm.updateField("editionId", ed.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                          isSelected
                            ? "border-nx-accent bg-nx-accent font-semibold text-nx-ground shadow-nx-xs"
                            : "border-nx-line bg-nx-ground text-nx-ink hover:border-nx-accent/40 hover:bg-nx-raised"
                        )}
                      >
                        <span className="text-[11px]">⭐</span>
                        <span>{ed.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edition — searchable GenericSelect with server search */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            {t("tenant.edition")} <span className="text-destructive">*</span>
          </Label>
          {vm.form.editionId && (
            <span className="text-xs text-nx-accent">
              {editionOptions.find((o) => o.value === vm.form.editionId)?.label}
            </span>
          )}
        </div>
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
          <p className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{t("tenant.editionRequired")}</span>
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
