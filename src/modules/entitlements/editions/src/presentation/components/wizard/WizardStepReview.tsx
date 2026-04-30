import { useI18n } from "@core/providers/i18n-provider";
import type { CreateEditionRequest, UpdateEditionRequest } from "../../../domain/entities/EditionRequests";

interface WizardStepReviewProps {
  form: CreateEditionRequest | UpdateEditionRequest;
  prices?: Record<string, string>;
}

export function WizardStepReview({ form, prices }: WizardStepReviewProps) {
  const { t } = useI18n();

  const priceEntries = prices ? Object.entries(prices).filter(([, v]) => v && parseFloat(v) > 0) : [];

  const getTrialString = () => {
    if (!form.allowTrial) return t("entitlements.editions.wizard.none") || "None";
    const days = form.trialDurationDays ?? 14;
    const isFree = form.trialIsFree;
    const discount = form.trialDiscountPercent;
    
    if (isFree) {
      return `${days}d (${t("entitlements.editions.wizard.free") || "free"})`;
    }
    return `${days}d (${discount}% ${t("entitlements.editions.wizard.off") || "off"})`;
  };

  const rows: Array<{ label: string; value: string }> = [
    { label: t("entitlements.editions.wizard.internalName") || "Internal Name", value: form.name || "—" },
    { label: t("entitlements.editions.wizard.displayEnAr") || "Display (EN/AR)", value: `${form.displayNameEn || "—"} / ${form.displayNameAr || "—"}` },
    { label: t("entitlements.editions.wizard.tierLevel") || "Tier Level", value: String(form.tierLevel ?? 0) },
    { label: t("entitlements.editions.wizard.tagline") || "Tagline", value: form.tagline || "—" },
  ];

  if ((form as UpdateEditionRequest).overflowPolicy) {
    rows.push({
      label: t("entitlements.editions.wizard.overflowPolicy") || "Overflow Policy",
      value: (form as UpdateEditionRequest).overflowPolicy || "Block",
    });
  }

  rows.push(
    {
      label: t("entitlements.editions.wizard.billingCycles") || "Billing Cycles",
      value: [
        form.allowMonthly && (t("entitlements.editions.wizard.monthly") || "Monthly"),
        form.allowYearly && (t("entitlements.editions.wizard.annual") || "Yearly"),
        form.allowLifetime && (t("entitlements.editions.wizard.lifetime") || "Lifetime"),
      ].filter(Boolean).join(", ") || (t("entitlements.editions.wizard.noneFree") || "None (Free)"),
    },
    {
      label: t("entitlements.editions.wizard.trial") || "Trial",
      value: getTrialString(),
    },
    {
      label: t("entitlements.editions.wizard.selfService") || "Self-Service",
      value: form.isSelfServiceEnabled ? (t("common.yes") || "Yes") : (t("common.no") || "No"),
    },
    {
      label: t("entitlements.editions.wizard.contactSalesOnly") || "Contact Sales Only",
      value: form.isContactSalesOnly ? (t("common.yes") || "Yes") : (t("common.no") || "No"),
    }
  );

  return (
    <div className="space-y-6">
      <div className="border border-border divide-y divide-border">
        {rows.map((r) => (
          <div key={r.label} className="px-4 py-3 flex justify-between gap-4">
            <span className="text-sm text-muted-foreground shrink-0">{r.label}</span>
            <span className="text-sm font-semibold text-right font-mono">{r.value}</span>
          </div>
        ))}
      </div>

      {priceEntries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("entitlements.editions.wizard.pricing") || "Pricing"}
          </h4>
          <div className="border border-border divide-y divide-border">
            {priceEntries.map(([key, val]) => {
              const [currency, cycle] = key.split("_");
              return (
                <div key={key} className="px-4 py-2.5 flex justify-between">
                  <span className="text-sm text-muted-foreground">{currency} — {cycle}</span>
                  <span className="text-sm font-semibold tabular-nums">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
