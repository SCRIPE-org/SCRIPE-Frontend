"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { Coins, ArrowRightLeft, RefreshCw, RotateCcw } from "lucide-react";
import {
  CRM_CURRENCY_OPTIONS,
  getCrossExchangeRate,
  type CrmModuleSettingsState,
} from "../../stores/useCrmSettingsStore";

/** Props for CrmCurrencySettingsCard. */
export interface CrmCurrencySettingsCardProps {
  settings: CrmModuleSettingsState;
  baseCurrency: string;
  rates: Record<string, number>;
  onRefreshLiveRates: () => Promise<void>;
  onNotifySaved: (msg: string) => void;
}

/**
 * Domain 1 Card: Multi-Currency & Triple-Value FX Engine (<210 lines).
 * Configures Tenant Base Currency, User Display Override, Live Exchange Rate Simulator, and USD Cross-Rate Table.
 */
export function CrmCurrencySettingsCard({
  settings,
  baseCurrency,
  rates,
  onRefreshLiveRates,
  onNotifySaved,
}: CrmCurrencySettingsCardProps) {
  const { t } = useI18n();
  const [simAmount, setSimAmount] = useState("10000");
  const [simFromCurrency, setSimFromCurrency] = useState("USD");
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);

  const numericSim = parseFloat(simAmount) || 0;
  const crossRate = getCrossExchangeRate(simFromCurrency, baseCurrency, rates);
  const convertedSim = Math.round(numericSim * crossRate * 100) / 100;

  const handleRefresh = async () => {
    setIsRefreshingRates(true);
    try {
      await onRefreshLiveRates();
      onNotifySaved(t("crm.settings.savedToast"));
    } finally {
      setIsRefreshingRates(false);
    }
  };

  return (
    <Card className="p-5 bg-nx-surface border-nx-line space-y-5" data-testid="crm-settings-currency-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-nx-line pb-4">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
            <Coins className="size-4 text-nx-accent" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-nx-ink">{t("crm.settings.domains.currency")}</h2>
            <p className="text-xs text-nx-ink-3 mt-0.5">{t("crm.settings.domains.currencyDesc")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-mono text-xs px-2.5 py-1">
            {baseCurrency}
          </Badge>
          {settings.userOverrideCurrency && (
            <Badge variant="outline" className="border-nx-line bg-nx-raised text-nx-ink-2 font-mono text-[10px]">
              {t("crm.settings.currency.userOverrideBadge")}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="crm-base-currency-select" className="text-xs font-semibold text-nx-ink">{t("crm.settings.currency.baseReportingCurrency")}</Label>
          <Select value={baseCurrency} onValueChange={(val) => settings.setBaseCurrency(val)}>
            <SelectTrigger id="crm-base-currency-select" data-testid="crm-settings-base-currency-select" className="h-9 text-xs bg-nx-ground border-nx-line text-nx-ink font-mono"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CRM_CURRENCY_OPTIONS.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol}) — {c.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="crm-user-override-currency-select" className="text-xs font-semibold text-nx-ink">{t("crm.settings.currency.userOverrideCurrency")}</Label>
          <Select value={settings.userOverrideCurrency || "INHERIT"} disabled={!settings.allowUserCurrencyOverride} onValueChange={(val) => settings.setUserOverrideCurrency(val === "INHERIT" ? null : val)}>
            <SelectTrigger id="crm-user-override-currency-select" data-testid="crm-settings-user-currency-select" className="h-9 text-xs bg-nx-ground border-nx-line text-nx-ink font-mono"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="INHERIT">{t("crm.settings.currency.inheritTenantCurrency")} ({settings.tenantBaseCurrency})</SelectItem>
              {CRM_CURRENCY_OPTIONS.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol}) — {c.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="crm-default-deal-currency-select" className="text-xs font-semibold text-nx-ink">{t("crm.settings.currency.defaultDealCurrency")}</Label>
          <Select value={settings.defaultDealCurrency} onValueChange={(val) => settings.setDefaultDealCurrency(val)}>
            <SelectTrigger id="crm-default-deal-currency-select" data-testid="crm-settings-default-deal-currency-select" className="h-9 text-xs bg-nx-ground border-nx-line text-nx-ink font-mono"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CRM_CURRENCY_OPTIONS.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol}) — {c.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3.5 flex items-start gap-3">
          <Checkbox id="crm-auto-convert-toggle" data-testid="crm-settings-auto-convert-checkbox" checked={settings.autoConvertToBase} onCheckedChange={(c) => settings.setAutoConvertToBase(Boolean(c))} className="mt-0.5" />
          <div className="space-y-0.5">
            <Label htmlFor="crm-auto-convert-toggle" className="text-xs font-semibold text-nx-ink cursor-pointer">{t("crm.settings.currency.autoConvertTitle")}</Label>
            <p className="text-[11px] text-nx-ink-3">{t("crm.settings.currency.autoConvertDesc")}</p>
          </div>
        </div>
        <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3.5 flex items-start gap-3">
          <Checkbox id="crm-dual-currency-toggle" data-testid="crm-settings-dual-currency-checkbox" checked={settings.showOriginalCurrencyOnConverted} onCheckedChange={(c) => settings.setShowOriginalCurrencyOnConverted(Boolean(c))} className="mt-0.5" />
          <div className="space-y-0.5">
            <Label htmlFor="crm-dual-currency-toggle" className="text-xs font-semibold text-nx-ink cursor-pointer">{t("crm.settings.currency.dualBadgeTitle")}</Label>
            <p className="text-[11px] text-nx-ink-3">{t("crm.settings.currency.dualBadgeDesc")}</p>
          </div>
        </div>
        <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3.5 flex items-start gap-3">
          <Checkbox id="crm-allow-user-override-toggle" checked={settings.allowUserCurrencyOverride} onCheckedChange={(c) => settings.updateSettings({ allowUserCurrencyOverride: Boolean(c) })} className="mt-0.5" />
          <div className="space-y-0.5">
            <Label htmlFor="crm-allow-user-override-toggle" className="text-xs font-semibold text-nx-ink cursor-pointer">{t("crm.settings.currency.allowUserOverride")}</Label>
            <p className="text-[11px] text-nx-ink-3">{t("crm.settings.currency.allowUserOverrideDesc")}</p>
          </div>
        </div>
        <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3.5 flex items-start gap-3">
          <Checkbox id="crm-snapshot-fx-toggle" checked={settings.snapshotExchangeRateOnDealCreation} onCheckedChange={(c) => settings.updateSettings({ snapshotExchangeRateOnDealCreation: Boolean(c) })} className="mt-0.5" />
          <div className="space-y-0.5">
            <Label htmlFor="crm-snapshot-fx-toggle" className="text-xs font-semibold text-nx-ink cursor-pointer">{t("crm.settings.currency.snapshotFxOnCreate")}</Label>
            <p className="text-[11px] text-nx-ink-3">{t("crm.settings.currency.snapshotFxOnCreateDesc")}</p>
          </div>
        </div>
      </div>

      <div className="rounded-nx-md border border-nx-line bg-nx-raised/30 p-4 space-y-3" data-testid="crm-currency-simulator">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="size-3.5 text-nx-accent" />
            <span className="text-xs font-bold text-nx-ink uppercase tracking-wider">{t("crm.settings.currency.simulatorTitle")}</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshingRates} data-testid="crm-refresh-rates-btn" className="h-7 text-[11px] gap-1.5 border-nx-line bg-nx-surface">
            <RefreshCw className={`size-3 ${isRefreshingRates ? "animate-spin" : ""}`} />
            <span>{t("crm.settings.currency.refreshRates")}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-[11px] text-nx-ink-3">{t("crm.settings.currency.dealEntryAmount")}</Label>
            <Input type="number" min={0} value={simAmount} onChange={(e) => setSimAmount(e.target.value)} data-testid="crm-sim-amount-input" className="h-8 text-xs font-mono bg-nx-ground border-nx-line text-nx-ink" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-nx-ink-3">{t("crm.settings.currency.dealEntryCurrency")}</Label>
            <Select value={simFromCurrency} onValueChange={setSimFromCurrency}>
              <SelectTrigger data-testid="crm-sim-from-currency" className="h-8 text-xs font-mono bg-nx-ground border-nx-line text-nx-ink"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CRM_CURRENCY_OPTIONS.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} — {c.nameEn}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-nx-md border border-nx-accent/30 bg-nx-accent-wash px-3 py-1.5" data-testid="crm-sim-result-box">
            <span className="text-[10px] text-nx-ink-3 uppercase font-semibold block">{t("crm.settings.currency.convertedOutput")} ({baseCurrency})</span>
            <span className="text-sm font-bold text-nx-accent font-mono tabular-nums block">{baseCurrency} {convertedSim.toLocaleString()}</span>
            <span className="text-[10px] font-mono text-nx-ink-2">1 {simFromCurrency} = {crossRate.toFixed(4)} {baseCurrency}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-nx-line/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-nx-ink-3">{t("crm.settings.currency.rateTableTitle")}</span>
            {Object.keys(settings.customRateOverrides).length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => settings.resetCustomRateOverrides()} className="h-6 text-[10px] text-nx-ink-3 hover:text-nx-ink gap-1">
                <RotateCcw className="size-2.5" />
                <span>{t("crm.settings.currency.resetRateOverrides")}</span>
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {["USD", "EGP", "SAR", "AED", "EUR", "GBP"].map((code) => (
              <div key={code} className="rounded-nx-sm border border-nx-line bg-nx-ground px-2.5 py-1.5 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-nx-ink">{code}</span>
                <span className="text-nx-ink-2">{(rates[code] ?? 1).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
