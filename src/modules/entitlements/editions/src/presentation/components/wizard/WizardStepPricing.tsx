"use client";

import { Input } from "@core/ui/input";
import { useI18n } from "@core/providers/i18n-provider";
import { DollarSign, Gift } from "lucide-react";
import type { CreateEditionRequest } from "../../../domain/entities/EditionRequests";

interface WizardStepPricingProps {
  form: CreateEditionRequest;
  prices: Record<string, string>;
  onPriceChange: (key: string, value: string) => void;
}

function SectionHeader({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-border mb-5">
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", SAR: "﷼", GBP: "£" };

export function WizardStepPricing({ form, prices, onPriceChange }: WizardStepPricingProps) {
  const { t } = useI18n();

  const cycles = [
    { key: "Monthly", label: t("entitlements.editions.wizard.monthly") || "Monthly", enabled: form.allowMonthly ?? false },
    { key: "Yearly", label: t("entitlements.editions.wizard.annual") || "Annual", enabled: form.allowYearly ?? false },
    { key: "Lifetime", label: t("entitlements.editions.wizard.lifetime") || "Lifetime", enabled: form.allowLifetime ?? false },
  ].filter((c) => c.enabled);

  const isFreeEdition = (form.tierLevel ?? 0) === 0;

  if (isFreeEdition) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <Gift className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          {t("entitlements.editions.wizard.freeTierTitle") || "Free Tier — No Pricing Needed"}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {t("entitlements.editions.wizard.freeTierDesc") || "Tier Level 0 editions are free by design. No pricing records will be created."}
        </p>
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="border border-dashed border-amber-500/30 bg-amber-500/5 p-8 text-center space-y-2">
        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
          {t("entitlements.editions.wizard.noBillingCycles") || "No billing cycles enabled. Go back and enable at least one."}
        </p>
      </div>
    );
  }

  const currencies = ["USD", "EUR", "SAR"];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={DollarSign}
        title={t("entitlements.editions.wizard.pricingSection") || "Multi-Currency Pricing"}
        desc={t("entitlements.editions.wizard.pricingDesc") || "Set prices for each currency and billing cycle."}
      />

      <div className="border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-start px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                {t("entitlements.editions.wizard.currency") || "Currency"}
              </th>
              {cycles.map((c) => (
                <th
                  key={c.key}
                  className="text-start px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currencies.map((currency) => (
              <tr key={currency} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-muted text-xs font-bold text-muted-foreground">
                      {CURRENCY_SYMBOLS[currency] || currency[0]}
                    </span>
                    <span className="font-semibold text-foreground">{currency}</span>
                  </div>
                </td>
                {cycles.map((c) => {
                  const key = `${currency}_${c.key}`;
                  return (
                    <td key={key} className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground text-xs shrink-0">
                          {CURRENCY_SYMBOLS[currency] || ""}
                        </span>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={prices[key] ?? ""}
                          onChange={(e) => onPriceChange(key, e.target.value)}
                          placeholder="—"
                          className="w-28 h-8 text-sm tabular-nums"
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
