// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
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

import React, { useMemo, useCallback, useState } from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { Checkbox } from "@core/ui/checkbox";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import { CreditCard, AlertTriangle, ShieldCheck } from "lucide-react";
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

/**
 * Presentation UI component rendering the create tenant step3.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CreateTenantStep3({ vm, t }: CreateTenantStep3Props) {
  const isFreeEdition = vm.selectedEdition?.isFree === true;
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

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
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <CreditCard className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t("tenant.stepPlan") || "Plan & Billing"}</h2>
          <p className="text-sm text-muted-foreground">
            {t("tenant.stepPlanDesc") ||
              "Choose an edition and configure billing. This step is optional."}
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

      {/* Free Edition Banner — shown when selected edition has no billing cycles */}
      {vm.form.editionId && isFreeEdition && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 duration-300 animate-in fade-in-0 slide-in-from-bottom-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {t("tenant.freeEditionSelected") || "Free Edition — No Billing Required"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("tenant.freeEditionDesc") ||
                "This edition is permanently free. A lifetime subscription will be created automatically at no cost. No payment configuration is needed."}
            </p>
          </div>
        </div>
      )}

      {/* Subscription Type & Currency — only shown after edition is selected and has enabled subscription types */}
      {vm.form.editionId && subscriptionTypeOptions.length > 0 && (
        <div className="grid gap-5 duration-300 animate-in fade-in-0 slide-in-from-bottom-2 sm:grid-cols-2">
          {/* Subscription Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("tenant.subscriptionType") || "Subscription Type"}
            </Label>
            <GenericSelect
              options={subscriptionTypeOptions}
              value={vm.form.subscriptionType}
              onValueChange={(v: string | string[]) =>
                vm.updateField("subscriptionType", v as string)
              }
              placeholder={t("tenant.selectSubscriptionType") || "Select type..."}
            />
            {subscriptionTypeOptions.length === 0 && (
              <p className="text-xs text-destructive">
                {t("tenant.noSubscriptionTypesAvailable") ||
                  "No subscription types are enabled for this edition."}
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

      {/* Promo Code — only shown if there are subscription types enabled */}
      {vm.form.editionId && subscriptionTypeOptions.length > 0 && (
        <div className="space-y-2 duration-300 animate-in fade-in-0 slide-in-from-bottom-2">
          <Label className="text-sm font-medium">{t("tenant.promoCode") || "Promo Code"}</Label>
          <Input
            value={vm.form.promoCode}
            onChange={(e) => vm.updateField("promoCode", e.target.value)}
            placeholder={t("tenant.promoCodePlaceholder") || "Enter promotional code (optional)"}
            className="h-11 font-mono uppercase"
          />
          {vm.availablePromotions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {vm.availablePromotions.map((promo) => {
                const isSelected = vm.form.promotionId === promo.id;

                return (
                  <Badge
                    key={promo.id}
                    variant={isSelected ? "default" : "secondary"}
                    className="cursor-pointer text-xs transition-colors hover:bg-primary/20"
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
                    {promo.name} (
                    {promo.type === "Percentage"
                      ? `${promo.discountValue}%`
                      : `$${promo.discountValue}`}
                    )
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Skip Payment Toggle — only shown for paid plans with enabled subscription types */}
      {vm.form.editionId && !isFreeEdition && subscriptionTypeOptions.length > 0 && (
        <div className="duration-300 animate-in fade-in-0 slide-in-from-bottom-2">
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium">{t("tenant.skipPayment") || "Skip Payment"}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("tenant.skipPaymentDesc") ||
                    "Activates the subscription without payment processing. Use for demos or manual billing."}
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

      {/* Advanced: Restrict Permissions */}
      <div className="rounded-xl border border-border/50 duration-300 animate-in fade-in-0">
        <button
          type="button"
          className="flex w-full items-center justify-between p-4 text-left"
          onClick={() => setIsPermissionsOpen((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {t("tenant.restrictPermissions") || "Restrict Admin Permissions"}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("tenant.restrictPermissionsDesc") ||
                  "Limit which permissions this tenant's admins can be assigned. Leave empty to allow all."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {vm.form.availablePermissionIds.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {vm.form.availablePermissionIds.length}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{isPermissionsOpen ? "▲" : "▼"}</span>
          </div>
        </button>

        {isPermissionsOpen && (
          <div className="border-t border-border/50 p-4">
            {vm.isLoadingPermissions ? (
              <p className="text-sm text-muted-foreground">
                {t("common.loading") || "Loading permissions..."}
              </p>
            ) : vm.creationPermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("tenant.noPermissionsAvailable") || "No permissions available."}
              </p>
            ) : (
              <PermissionPicker vm={vm} t={t} />
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {vm.form.editionId && <CreateTenantSummary vm={vm} t={t} />}
    </div>
  );
}

// ── Permission Picker (grouped by module/category) ──────────

function PermissionPicker({ vm, t }: { vm: CreateTenantVM; t: (key: string) => string }) {
  const selected = new Set(vm.form.availablePermissionIds);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof vm.creationPermissions>();
    for (const p of vm.creationPermissions) {
      const key = p.module || p.category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [vm.creationPermissions]);

  const toggle = useCallback(
    (permId: string) => {
      const next = new Set(selected);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      vm.updateField("availablePermissionIds", Array.from(next));
    },
    [selected, vm]
  );

  const toggleAll = useCallback(() => {
    if (selected.size === vm.creationPermissions.length) {
      vm.updateField("availablePermissionIds", []);
    } else {
      vm.updateField(
        "availablePermissionIds",
        vm.creationPermissions.map((p) => p.id)
      );
    }
  }, [selected, vm]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {selected.size > 0
            ? `${selected.size} / ${vm.creationPermissions.length} ${t("tenant.permissionsSelected") || "selected"}`
            : t("tenant.allPermissionsAllowed") || "All permissions allowed (no restriction)"}
        </p>
        <button
          type="button"
          className="text-xs text-primary underline-offset-2 hover:underline"
          onClick={toggleAll}
        >
          {selected.size === vm.creationPermissions.length
            ? t("common.deselectAll") || "Deselect all"
            : t("common.selectAll") || "Select all"}
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-lg border border-border/40 bg-muted/20 p-2">
        {grouped.map(([group, perms]) => (
          <div key={group} className="mb-3 last:mb-0">
            <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group}
            </p>
            <div className="space-y-1">
              {perms.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selected.has(p.id)}
                    onCheckedChange={() => toggle(p.id)}
                    id={`perm-${p.id}`}
                  />
                  <span className="flex-1">{p.getLocalizedName()}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{p.code}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Inline Summary (co-located, only used here) ─────────────

function CreateTenantSummary({ vm, t }: { vm: CreateTenantVM; t: (key: string) => string }) {
  const isFree = vm.selectedEdition?.isFree === true;

  const subscriptionLabel = useMemo(() => {
    if (isFree) return t("tenant.freeEditionLifetime") || "Free (Lifetime)";
    const map: Record<string, string> = {
      Monthly: t("tenant.subscriptionTypes.monthly") || "Monthly",
      Yearly: t("tenant.subscriptionTypes.yearly") || "Yearly",
      Lifetime: t("tenant.subscriptionTypes.lifetime") || "Lifetime",
      Trial: t("tenant.subscriptionTypes.trial") || "Trial",
    };
    return map[vm.form.subscriptionType] || vm.form.subscriptionType || "-";
  }, [vm.form.subscriptionType, isFree, t]);

  const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === vm.form.currency);
  const currencyLabel = currencyInfo
    ? `${currencyInfo.code} (${currencyInfo.symbol})`
    : vm.form.currency;

  return (
    <div className="space-y-2 rounded-xl border border-border/50 bg-muted/30 p-4 duration-300 animate-in fade-in-0">
      <h4 className="mb-3 text-sm font-semibold">{t("tenant.summary") || "Summary"}</h4>
      <SummaryRow
        label={t("tenant.edition") || "Edition"}
        value={vm.selectedEdition?.name || "-"}
      />
      <SummaryRow label={t("tenant.subscriptionType") || "Billing"} value={subscriptionLabel} />
      {!isFree && <SummaryRow label={t("tenant.currency") || "Currency"} value={currencyLabel} />}
      {vm.form.promotionId && (
        <SummaryRow
          label={t("tenant.promotion") || "Promotion"}
          value={
            vm.availablePromotions.find((p) => p.id === vm.form.promotionId)?.name ||
            vm.form.promoCode ||
            "Applied"
          }
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

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-medium text-amber-500" : "font-medium"}>{value}</span>
    </div>
  );
}
