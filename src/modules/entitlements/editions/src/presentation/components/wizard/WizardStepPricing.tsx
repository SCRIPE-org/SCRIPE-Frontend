import { Input } from "@core/ui/input";
import { useI18n } from "@core/providers/i18n-provider";
import type { CreateEditionRequest } from "../../../domain/entities/EditionRequests";

interface WizardStepPricingProps {
  form: CreateEditionRequest;
  prices: Record<string, string>;
  onPriceChange: (key: string, value: string) => void;
}

export function WizardStepPricing({ form, prices, onPriceChange }: WizardStepPricingProps) {
  const { t } = useI18n();

  const cycles = [
    {
      key: "Monthly",
      label: t("entitlements.editions.wizard.monthly") || "Monthly",
      enabled: form.allowMonthly ?? false,
    },
    {
      key: "Yearly",
      label: t("entitlements.editions.wizard.annual") || "Annual",
      enabled: form.allowYearly ?? false,
    },
    {
      key: "Lifetime",
      label: t("entitlements.editions.wizard.lifetime") || "Lifetime",
      enabled: form.allowLifetime ?? false,
    },
  ].filter((c) => c.enabled);

  const isFreeEdition = (form.tierLevel ?? 0) === 0;

  if (isFreeEdition) {
    return (
      <div className="border border-dashed border-border p-8 text-center space-y-2">
        <div className="text-4xl">🆓</div>
        <h3 className="font-semibold">{t("entitlements.editions.wizard.freeTierTitle") || "Free Tier — No pricing needed"}</h3>
        <p className="text-sm text-muted-foreground">
          {t("entitlements.editions.wizard.freeTierDesc") || "Tier Level 0 editions are always free. No price records will be created."}
        </p>
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t("entitlements.editions.wizard.noBillingCycles") || "No billing cycles enabled. Go back to Billing and enable at least one cycle."}
        </p>
      </div>
    );
  }

  const currencies = ["USD", "EUR", "SAR"];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("entitlements.editions.wizard.pricingDesc") || "Set prices for each currency × billing cycle combination. Leave blank = not available for that combination."}
      </p>
      <div className="border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                {t("entitlements.editions.wizard.currency") || "Currency"}
              </th>
              {cycles.map((c) => (
                <th
                  key={c.key}
                  className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase text-xs tracking-wider"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currencies.map((currency) => (
              <tr key={currency} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-semibold text-foreground">{currency}</td>
                {cycles.map((c) => {
                  const key = `${currency}_${c.key}`;
                  return (
                    <td key={key} className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground text-xs">
                          {currency === "USD" ? "$" : currency === "EUR" ? "€" : "﷼"}
                        </span>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={prices[key] ?? ""}
                          onChange={(e) => onPriceChange(key, e.target.value)}
                          placeholder="—"
                          className="w-28 h-8 text-sm"
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
