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
import { cn } from "@core/common/utils";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { Checkbox } from "@core/ui/checkbox";
import { DetailRow } from "@core/ui/detail-row";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import { CreditCard, AlertTriangle, ShieldCheck, ChevronDown } from "lucide-react";
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
        <Label>{t("tenant.edition")}</Label>
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
      </div>

      {/* Free Edition Banner — shown when selected edition has no billing cycles */}
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

      {/* Subscription Type & Currency — only shown after edition is selected and has enabled subscription types */}
      {vm.form.editionId && subscriptionTypeOptions.length > 0 && (
        <div className="grid gap-5 duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0 motion-safe:slide-in-from-bottom-2 sm:grid-cols-2">
          {/* Subscription Type */}
          <div className="space-y-2">
            <Label>
              {t("tenant.subscriptionType")}
            </Label>
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

          {/* Currency */}
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

      {/* Promo Code — only shown if there are subscription types enabled */}
      {vm.form.editionId && subscriptionTypeOptions.length > 0 && (
        <div className="space-y-2 duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0 motion-safe:slide-in-from-bottom-2">
          <Label>{t("tenant.promoCode")}</Label>
          <Input
            value={vm.form.promoCode}
            onChange={(e) => vm.updateField("promoCode", e.target.value)}
            placeholder={t("tenant.promoCodePlaceholder")}
            className="font-mono uppercase"
          />
          {vm.availablePromotions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {vm.availablePromotions.map((promo) => {
                const isSelected = vm.form.promotionId === promo.id;

                return (
                  // A real button, not an onClick span: Badge is documented as a
                  // non-interactive reading (badge.tsx) and renders a bare <span>,
                  // which is invisible to keyboard/screen-reader users as a control.
                  <button
                    key={promo.id}
                    type="button"
                    className="rounded-full transition-colors duration-nx-micro ease-nx-enter focus-visible:outline-none focus-visible:shadow-nx-focus motion-reduce:transition-none"
                    aria-pressed={isSelected}
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
                    <Badge
                      variant={isSelected ? "default" : "secondary"}
                      className="cursor-pointer text-xs transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-accent-wash motion-reduce:transition-none"
                    >
                      {promo.name} (
                      {promo.type === "Percentage"
                        ? `${promo.discountValue}%`
                        : `$${promo.discountValue}`}
                      )
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Skip Payment Toggle — only shown for paid plans with enabled subscription types */}
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

      {/* Advanced: Restrict Permissions */}
      <div className="rounded-nx-md border border-nx-line duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0">
        <button
          type="button"
          aria-expanded={isPermissionsOpen}
          className="flex w-full items-center justify-between rounded-nx-md p-4 text-start transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover focus-visible:outline-none focus-visible:shadow-nx-focus motion-reduce:transition-none"
          onClick={() => setIsPermissionsOpen((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-nx-ink-2" />
            <div>
              <p>
                {t("tenant.restrictPermissions")}
              </p>
              <p className="text-xs text-nx-ink-2">
                {t("tenant.restrictPermissionsDesc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {vm.form.availablePermissionIds.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {vm.form.availablePermissionIds.length}
              </Badge>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-nx-ink-3 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                isPermissionsOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </div>
        </button>

        {isPermissionsOpen && (
          <div className="border-t border-nx-line p-4">
            {vm.isLoadingPermissions ? (
              <p className="text-sm text-nx-ink-2">
                {t("common.loading")}
              </p>
            ) : vm.creationPermissions.length === 0 ? (
              <p className="text-sm text-nx-ink-2">
                {t("tenant.noPermissionsAvailable")}
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
      const key = p.module || p.category || t("tenant.other");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [vm.creationPermissions, t]);

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
        <p className="text-xs text-nx-ink-2">
          {selected.size > 0
            ? `${selected.size} / ${vm.creationPermissions.length} ${t("tenant.permissionsSelected")}`
            : t("tenant.allPermissionsAllowed")}
        </p>
        <button
          type="button"
          className="text-xs text-nx-accent underline-offset-2 hover:underline"
          onClick={toggleAll}
        >
          {selected.size === vm.creationPermissions.length
            ? t("common.deselectAll")
            : t("common.selectAll")}
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-nx-md border border-nx-line bg-nx-raised p-2">
        {grouped.map(([group, perms]) => (
          <div key={group} className="mb-3 last:mb-0">
            <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-nx-ink-2">
              {group}
            </p>
            <div className="space-y-1">
              {perms.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded-nx-sm px-2 py-1.5 text-sm hover:bg-nx-raised"
                >
                  <Checkbox
                    checked={selected.has(p.id)}
                    onCheckedChange={() => toggle(p.id)}
                    id={`perm-${p.id}`}
                  />
                  <span className="flex-1">{p.getLocalizedName()}</span>
                  <span className="font-mono text-[11px] text-nx-ink-2">{p.code}</span>
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
    if (isFree) return t("tenant.freeEditionLifetime");
    const map: Record<string, string> = {
      Monthly: t("tenant.subscriptionTypes.monthly"),
      Yearly: t("tenant.subscriptionTypes.yearly"),
      Lifetime: t("tenant.subscriptionTypes.lifetime"),
      Trial: t("tenant.subscriptionTypes.trial"),
    };
    return map[vm.form.subscriptionType] || vm.form.subscriptionType || "-";
  }, [vm.form.subscriptionType, isFree, t]);

  const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === vm.form.currency);
  const currencyLabel = currencyInfo
    ? `${currencyInfo.code} (${currencyInfo.symbol})`
    : vm.form.currency;

  return (
    <div className="space-y-2 rounded-nx-md border border-nx-line bg-nx-raised p-4 duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0">
      <h4 className="mb-3 text-sm font-semibold">{t("tenant.summary")}</h4>
      <DetailRow label={t("tenant.edition")} value={vm.selectedEdition?.name || "-"} />
      <DetailRow label={t("tenant.subscriptionType")} value={subscriptionLabel} />
      {!isFree && <DetailRow label={t("tenant.currency")} value={currencyLabel} />}
      {vm.form.promotionId && (
        <DetailRow
          label={t("tenant.promotion")}
          value={
            vm.availablePromotions.find((p) => p.id === vm.form.promotionId)?.name ||
            vm.form.promoCode ||
            t("tenant.promoApplied")
          }
          valueClassName="text-warning"
        />
      )}
      {!vm.form.promotionId && vm.form.promoCode && (
        <DetailRow label={t("tenant.promotion")} value={vm.form.promoCode} valueClassName="text-warning" />
      )}
      {vm.form.skipPayment && (
        <DetailRow label={t("tenant.payment")} value={t("tenant.skipped")} valueClassName="text-warning" />
      )}
    </div>
  );
}
