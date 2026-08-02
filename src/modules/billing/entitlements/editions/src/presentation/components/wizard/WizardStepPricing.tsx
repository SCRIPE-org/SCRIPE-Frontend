"use client";

import { Input } from "@core/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@core/ui/table";
import { useI18n } from "@core/providers/i18n-provider";
import { DollarSign, Gift } from "lucide-react";
import type { CreateEditionRequest } from "../../../domain/entities/EditionRequests";

interface WizardStepPricingProps {
  form: CreateEditionRequest;
  prices: Record<string, string>;
  onPriceChange: (key: string, value: string) => void;
}

function SectionHeader({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-nx-line pb-4">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-nx-md bg-nx-accent-wash">
        <Icon className="h-4.5 w-4.5 text-nx-accent" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-nx-ink">{title}</h3>
        <p className="mt-0.5 text-xs text-nx-ink-3">{desc}</p>
      </div>
    </div>
  );
}

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", SAR: "﷼", GBP: "£" };

/**
 * Presentation UI component rendering the wizard step pricing.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WizardStepPricing({ form, prices, onPriceChange }: WizardStepPricingProps) {
  const { t } = useI18n();

  const cycles = [
    {
      key: "Monthly",
      label: t("entitlements.editions.wizard.monthly"),
      enabled: form.allowMonthly ?? false,
    },
    {
      key: "Yearly",
      label: t("entitlements.editions.wizard.annual"),
      enabled: form.allowYearly ?? false,
    },
    {
      key: "Lifetime",
      label: t("entitlements.editions.wizard.lifetime"),
      enabled: form.allowLifetime ?? false,
    },
  ].filter((c) => c.enabled);

  // An edition is "free" when no billing cycles are enabled — matches backend IsFree exactly
  const isFreeEdition =
    !form.allowMonthly && !form.allowYearly && !form.allowLifetime && !form.allowTrial;

  if (isFreeEdition) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-nx-lg bg-success/10">
          <Gift className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-lg font-bold text-nx-ink">
          {t("entitlements.editions.wizard.freeTierTitle")}
        </h3>
        <p className="max-w-md text-center text-sm text-nx-ink-3">
          {t("entitlements.editions.wizard.freeTierDesc")}
        </p>
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="space-y-2 border border-dashed border-warning/30 bg-warning/5 p-8 text-center">
        <p className="text-sm font-medium text-warning">
          {t("entitlements.editions.wizard.noBillingCycles")}
        </p>
      </div>
    );
  }

  const currencies = ["USD", "EUR", "SAR"];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={DollarSign}
        title={t("entitlements.editions.wizard.pricingSection")}
        desc={t("entitlements.editions.wizard.pricingDesc")}
      />

      <div className="overflow-hidden rounded-nx-md border border-nx-line">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("entitlements.editions.wizard.currency")}</TableHead>
              {cycles.map((c) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencies.map((currency) => (
              <TableRow key={currency}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-nx-sm bg-nx-raised text-xs font-bold text-nx-ink-2">
                      {CURRENCY_SYMBOLS[currency] || currency[0]}
                    </span>
                    <span className="font-semibold text-nx-ink">{currency}</span>
                  </div>
                </TableCell>
                {cycles.map((c) => {
                  const key = `${currency}_${c.key}`;
                  return (
                    <TableCell key={key}>
                      <div className="flex items-center gap-1.5">
                        <span className="shrink-0 text-xs text-nx-ink-3">
                          {CURRENCY_SYMBOLS[currency] || ""}
                        </span>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={prices[key] ?? ""}
                          onChange={(e) => onPriceChange(key, e.target.value)}
                          placeholder="—"
                          className="h-8 w-28 text-sm tabular-nums"
                        />
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
