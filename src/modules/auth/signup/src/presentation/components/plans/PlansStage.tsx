// UI-EXCEPTION: compact studio layout
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { usePlanPicker, type PlanPickerEdition } from "../../viewmodels/usePlanPicker";
import type { SignupWizardViewModel } from "../../viewmodels/useSignupWizard";
import { IndustrySwitch } from "./IndustrySwitch";
import { BillingCycleToggle } from "./BillingCycleToggle";
import { RegionLine } from "./RegionLine";
import { PlanGrid } from "./PlanGrid";
import { FeatureComparison } from "./FeatureComparison";

// ═══════════════════════════════════════════════════════════════════════════
// PlansStage — the Elevate plans phase (F4). Composes heading + IndustrySwitch
// + BillingCycleToggle + RegionLine + PlanGrid + FeatureComparison, and handles
// loading (skeleton cards) / error / empty.
//
// Async recommendation: the badge appears once wizard.recommendation resolves;
// while it is loading (or absent) every card simply renders without a badge —
// the page never blocks. The viewmodel flags each edition's isRecommended off
// the encrypted recommendedEditionId, so the grid reacts automatically.
//
// MVVM: this composer holds the usePlanPicker viewmodel (catalog/pricing) and
// delegates selection to the wizard's selectPlan (the single layer that owns
// the SelectedPlan snapshot + phase advance). Components below stay dumb.
// ═══════════════════════════════════════════════════════════════════════════

interface PlansStageProps {
  wizard: SignupWizardViewModel;
}

/**
 * Presentation UI component rendering the plans stage.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PlansStage({ wizard }: PlansStageProps) {
  const { t } = useI18n();
  const { tokens } = useSignupTheme();

  const vm = usePlanPicker({
    businessType: wizard.businessType,
    discoveryAnswers: wizard.discoveryAnswers,
    recommendation: wizard.recommendation,
    initialCurrency: wizard.initialCurrency,
    initialCountry: wizard.initialCountry,
  });

  const hasAnswers = Object.keys(wizard.discoveryAnswers).length > 0;

  // Reasons line shown on the recommended card — empty while the rec is in flight.
  const reasons = wizard.recommendation?.reasons ?? [];

  const handleSelect = (edition: PlanPickerEdition, cycle: "monthly" | "annual") => {
    wizard.selectPlan(edition.raw, cycle);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-10 px-5 py-10 sm:px-8 sm:py-14">
      {/* ── Heading ── */}
      <header className="flex flex-col items-center gap-3 text-center">
        <h1
          className="font-semibold"
          style={{
            color: tokens.ink,
            fontSize: "clamp(1.75rem, 1.4rem + 1.6vw, 2.75rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            textWrap: "balance",
          }}
        >
          {t("signup.plans.title")}
        </h1>
        <p className="max-w-xl text-[0.9375rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
          {t("signup.plans.subtitle")}
        </p>
      </header>

      {/* ── Controls: industry switch · billing toggle · region line ── */}
      <div className="flex flex-col items-center gap-4">
        <IndustrySwitch
          value={vm.activeIndustry}
          options={vm.industries}
          onChange={vm.setIndustry}
          hasAnswers={hasAnswers}
        />
        {vm.hasPaidEditions && (
          <BillingCycleToggle
            value={vm.billingCycle}
            onChange={vm.setBillingCycle}
            savingsPercent={vm.annualSavingsPercent}
          />
        )}
        <RegionLine currency={vm.currency} detectedCountry={vm.detectedCountry} />
      </div>

      {/* ── Body: loading / error / empty / grid ── */}
      {vm.isLoading ? (
        <SkeletonGrid tokens={tokens} />
      ) : vm.isError ? (
        <ErrorState onRetry={vm.retry} />
      ) : vm.editions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <PlanGrid
            editions={vm.editions}
            billingCycle={vm.billingCycle}
            currency={vm.currency}
            locale={vm.locale}
            isFxConverted={vm.isFxConverted}
            reasons={reasons}
            onSelect={handleSelect}
          />
          <FeatureComparison
            categories={vm.comparisonCategories}
            editions={vm.editions}
            billingCycle={vm.billingCycle}
            currency={vm.currency}
            locale={vm.locale}
            isFxConverted={vm.isFxConverted}
            priorityKeys={vm.priorityKeys}
          />
        </>
      )}
    </div>
  );
}

// ─── States ──────────────────────────────────────────────────────────────────

function SkeletonGrid({ tokens }: { tokens: { surfaceRaised: string; borderCard: string } }) {
  return (
    <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[26rem] animate-pulse rounded-2xl motion-reduce:animate-none"
          style={{ background: tokens.surfaceRaised, border: tokens.borderCard }}
        />
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  const { tokens } = useSignupTheme();
  return (
    <div
      className="mx-auto flex max-w-md flex-col items-start gap-4 rounded-2xl p-7"
      style={{ background: tokens.surfaceCard, border: tokens.borderCard }}
    >
      <h2 className="text-[1.0625rem] font-semibold" style={{ color: tokens.ink }}>
        {t("signup.plans.error.title")}
      </h2>
      <p className="text-[0.875rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
        {t("signup.plans.error.body")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg px-4 py-2.5 text-[0.875rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none"
        style={{ background: tokens.gradientCta, color: tokens.accentContrast }}
      >
        {t("signup.plans.error.retry")}
      </button>
    </div>
  );
}

function EmptyState() {
  const { t } = useI18n();
  const { tokens } = useSignupTheme();
  return (
    <div className="py-16 text-center text-[0.9375rem]" style={{ color: tokens.inkFaint }}>
      {t("signup.plans.empty")}
    </div>
  );
}

export default PlansStage;
