"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Check, X, ClipboardCheck } from "lucide-react";
import type {
  CreateEditionRequest,
  UpdateEditionRequest,
} from "../../../domain/entities/EditionRequests";

interface WizardStepReviewProps {
  form: CreateEditionRequest | UpdateEditionRequest;
  prices?: Record<string, string>;
}

function ReviewRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/20">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className={`text-end text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function BoolBadge({
  value,
  yesLabel,
  noLabel,
}: {
  value: boolean;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <Badge variant={value ? "default" : "secondary"} className="gap-1 text-xs">
      {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {value ? yesLabel : noLabel}
    </Badge>
  );
}

/**
 * React presentation component representing the wizard step review UI element.
 */
export function WizardStepReview({ form, prices }: WizardStepReviewProps) {
  const { t } = useI18n();

  const priceEntries = prices
    ? Object.entries(prices).filter(([, v]) => v && parseFloat(v) > 0)
    : [];

  const yesLabel = t("entitlements.editions.wizard.yes") || "Yes";
  const noLabel = t("entitlements.editions.wizard.no") || "No";

  const getTrialString = () => {
    if (!form.allowTrial) return t("entitlements.editions.wizard.none") || "None";
    const days = form.trialDurationDays ?? 14;
    const isFree = form.trialIsFree;
    const discount = form.trialDiscountPercent;
    if (isFree) return `${days}d (${t("entitlements.editions.wizard.free") || "free"})`;
    return `${days}d (${discount}% ${t("entitlements.editions.wizard.off") || "off"})`;
  };

  const cyclesDisplay = [
    form.allowMonthly && (t("entitlements.editions.wizard.monthly") || "Monthly"),
    form.allowYearly && (t("entitlements.editions.wizard.annual") || "Annual"),
    form.allowLifetime && (t("entitlements.editions.wizard.lifetime") || "Lifetime"),
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-border pb-4">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardCheck className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("entitlements.editions.wizard.reviewSection") || "Review & Confirm"}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("entitlements.editions.wizard.reviewSectionDesc") ||
              "Verify all settings before creating."}
          </p>
        </div>
      </div>

      {/* General */}
      <div className="border border-border">
        <div className="border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("entitlements.editions.wizard.sectionGeneral") || "General"}
        </div>
        <ReviewRow
          label={t("entitlements.editions.wizard.internalName") || "Internal Name"}
          value={form.name || "—"}
          mono
        />
        <ReviewRow
          label={t("entitlements.editions.wizard.displayEnAr") || "Display Name"}
          value={`${form.displayNameEn || "—"} / ${form.displayNameAr || "—"}`}
        />
        <ReviewRow
          label={t("entitlements.editions.wizard.tierLevel") || "Tier Level"}
          value={String(form.tierLevel ?? 0)}
          mono
        />
        {form.tagline && (
          <ReviewRow
            label={t("entitlements.editions.wizard.tagline") || "Tagline"}
            value={form.tagline}
          />
        )}
        {(form as UpdateEditionRequest).overflowPolicy && (
          <ReviewRow
            label={t("entitlements.editions.wizard.overflowPolicy") || "Overflow Policy"}
            value={<Badge variant="outline">{(form as UpdateEditionRequest).overflowPolicy}</Badge>}
          />
        )}
      </div>

      {/* Billing */}
      <div className="border border-border">
        <div className="border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("entitlements.editions.wizard.sectionBilling") || "Billing"}
        </div>
        <ReviewRow
          label={t("entitlements.editions.wizard.billingCycles") || "Billing Cycles"}
          value={
            cyclesDisplay.length > 0 ? (
              <div className="flex flex-wrap justify-end gap-1.5">
                {cyclesDisplay.map((c) => (
                  <Badge key={c as string} variant="outline" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="italic text-muted-foreground">
                {t("entitlements.editions.wizard.noneFree") || "None (Free Tier)"}
              </span>
            )
          }
        />
        <ReviewRow
          label={t("entitlements.editions.wizard.trial") || "Trial Period"}
          value={getTrialString()}
        />
        <ReviewRow
          label={t("entitlements.editions.wizard.selfService") || "Self-Service"}
          value={
            <BoolBadge
              value={form.isSelfServiceEnabled ?? true}
              yesLabel={yesLabel}
              noLabel={noLabel}
            />
          }
        />
        <ReviewRow
          label={t("entitlements.editions.wizard.contactSalesOnly") || "Contact Sales Only"}
          value={
            <BoolBadge
              value={form.isContactSalesOnly ?? false}
              yesLabel={yesLabel}
              noLabel={noLabel}
            />
          }
        />
      </div>

      {/* Pricing */}
      {priceEntries.length > 0 && (
        <div className="border border-border">
          <div className="border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("entitlements.editions.wizard.pricing") || "Pricing Matrix"}
          </div>
          {priceEntries.map(([key, val]) => {
            const [currency, cycle] = key.split("_");
            return (
              <ReviewRow
                key={key}
                label={`${currency} — ${cycle}`}
                value={
                  <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {val}
                  </span>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
