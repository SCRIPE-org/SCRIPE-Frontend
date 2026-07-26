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
    <div className="flex items-start justify-between gap-4 border-b border-nx-line px-4 py-3 transition-colors duration-nx-micro ease-nx-enter last:border-b-0 hover:bg-nx-hover motion-reduce:transition-none">
      <span className="shrink-0 text-sm text-nx-ink-3">{label}</span>
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
 * Presentation UI component rendering the wizard step review.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WizardStepReview({ form, prices }: WizardStepReviewProps) {
  const { t } = useI18n();

  const priceEntries = prices
    ? Object.entries(prices).filter(([, v]) => v && parseFloat(v) > 0)
    : [];

  const yesLabel = t("entitlements.editions.wizard.yes");
  const noLabel = t("entitlements.editions.wizard.no");

  const getTrialString = () => {
    if (!form.allowTrial) return t("entitlements.editions.wizard.none");
    const days = form.trialDurationDays ?? 14;
    const isFree = form.trialIsFree;
    const discount = form.trialDiscountPercent;
    if (isFree) return `${days}d (${t("entitlements.editions.wizard.free")})`;
    return `${days}d (${discount}% ${t("entitlements.editions.wizard.off")})`;
  };

  const cyclesDisplay = [
    form.allowMonthly && t("entitlements.editions.wizard.monthly"),
    form.allowYearly && t("entitlements.editions.wizard.annual"),
    form.allowLifetime && t("entitlements.editions.wizard.lifetime"),
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-nx-line pb-4">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-nx-md bg-nx-accent-wash">
          <ClipboardCheck className="h-4.5 w-4.5 text-nx-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-nx-ink">
            {t("entitlements.editions.wizard.reviewSection")}
          </h3>
          <p className="mt-0.5 text-xs text-nx-ink-3">
            {t("entitlements.editions.wizard.reviewSectionDesc")}
          </p>
        </div>
      </div>

      {/* General */}
      <div className="border border-nx-line">
        <div className="border-b border-nx-line bg-nx-raised px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
          {t("entitlements.editions.wizard.sectionGeneral")}
        </div>
        <ReviewRow
          label={t("entitlements.editions.wizard.internalName")}
          value={form.name || "—"}
          mono
        />
        <ReviewRow
          label={t("entitlements.editions.wizard.displayEnAr")}
          value={`${form.displayNameEn || "—"} / ${form.displayNameAr || "—"}`}
        />
        <ReviewRow
          label={t("entitlements.editions.wizard.tierLevel")}
          value={String(form.tierLevel ?? 0)}
          mono
        />
        {form.tagline && (
          <ReviewRow label={t("entitlements.editions.wizard.tagline")} value={form.tagline} />
        )}
        {(form as UpdateEditionRequest).overflowPolicy && (
          <ReviewRow
            label={t("entitlements.editions.wizard.overflowPolicy")}
            value={<Badge variant="outline">{(form as UpdateEditionRequest).overflowPolicy}</Badge>}
          />
        )}
      </div>

      {/* Billing */}
      <div className="border border-nx-line">
        <div className="border-b border-nx-line bg-nx-raised px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
          {t("entitlements.editions.wizard.sectionBilling")}
        </div>
        <ReviewRow
          label={t("entitlements.editions.wizard.billingCycles")}
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
              <span className="italic text-nx-ink-3">
                {t("entitlements.editions.wizard.noneFree")}
              </span>
            )
          }
        />
        <ReviewRow label={t("entitlements.editions.wizard.trial")} value={getTrialString()} />
        <ReviewRow
          label={t("entitlements.editions.wizard.selfService")}
          value={
            <BoolBadge
              value={form.isSelfServiceEnabled ?? true}
              yesLabel={yesLabel}
              noLabel={noLabel}
            />
          }
        />
        <ReviewRow
          label={t("entitlements.editions.wizard.contactSalesOnly")}
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
        <div className="border border-nx-line">
          <div className="border-b border-nx-line bg-nx-raised px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("entitlements.editions.wizard.pricing")}
          </div>
          {priceEntries.map(([key, val]) => {
            const [currency, cycle] = key.split("_");
            return (
              <ReviewRow
                key={key}
                label={`${currency} — ${cycle}`}
                value={<span className="font-semibold tabular-nums text-success">{val}</span>}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
