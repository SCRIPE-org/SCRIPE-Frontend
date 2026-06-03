"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { usePlanPickerViewModel } from "../viewmodels/usePlanPickerViewModel";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanPickerStepProps {
  onSelectPlan: (
    edition: { id: string; name: string; trialDays: number | null; checkoutMode: string },
    billingCycle: "monthly" | "annual"
  ) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PlanPickerStep — Step 1 of the Signup Wizard (pure render)
 *
 * All business logic (edition fetching, billing toggle, savings computation)
 * lives in usePlanPickerViewModel.
 * This component is a pure render — no DI imports, no HTTP calls.
 *
 * Per tenant-signup.md §2 Step 1:
 * - Render editions where checkoutMode = self-service
 * - Monthly ⇄ Annual toggle with "save X%"
 * - Cards: name, tagline, price, badge, features, CTA
 * - Contact Sales cards shown but routed differently
 * - Cards use sxRise + sx-stagger entrance (motion.md)
 */
export function PlanPickerStep({ onSelectPlan }: PlanPickerStepProps) {
  const { t } = useI18n();
  const vm = usePlanPickerViewModel(onSelectPlan);

  // ── Loading skeleton ──
  if (vm.isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="mx-auto h-7 w-48" />
          <Skeleton className="mx-auto mt-2 h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={vm.direction}>
      {/* Header */}
      <div className="text-center">
        <h2
          className="text-xl font-bold tracking-tight sm:text-2xl"
          style={{ color: "rgba(245,242,255,0.95)" }}
        >
          {t("signup.plan.title") || "Choose your plan"}
        </h2>
        <p
          className="mt-1 text-sm"
          style={{ color: "rgba(245,242,255,0.55)" }}
        >
          {t("signup.plan.subtitle") || "Select the plan that fits your needs"}
        </p>
      </div>

      {/* Billing toggle — only show if there are paid plans */}
      {vm.editions.some((e) => e.monthlyPrice > 0) && (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => vm.setBillingCycle("monthly")}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200"
            style={{
              background:
                vm.billingCycle === "monthly"
                  ? "linear-gradient(180deg, rgba(168,85,247,0.2) 0%, rgba(124,58,237,0.15) 100%)"
                  : "transparent",
              color:
                vm.billingCycle === "monthly"
                  ? "rgba(245,242,255,0.95)"
                  : "rgba(245,242,255,0.45)",
              border:
                vm.billingCycle === "monthly"
                  ? "1px solid rgba(168,85,247,0.4)"
                  : "1px solid transparent",
            }}
          >
            {t("signup.plan.monthly") || "Monthly"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => vm.setBillingCycle("annual")}
            className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200"
            style={{
              background:
                vm.billingCycle === "annual"
                  ? "linear-gradient(180deg, rgba(168,85,247,0.2) 0%, rgba(124,58,237,0.15) 100%)"
                  : "transparent",
              color:
                vm.billingCycle === "annual"
                  ? "rgba(245,242,255,0.95)"
                  : "rgba(245,242,255,0.45)",
              border:
                vm.billingCycle === "annual"
                  ? "1px solid rgba(168,85,247,0.4)"
                  : "1px solid transparent",
            }}
          >
            {t("signup.plan.annual") || "Annual"}
            {vm.annualSavingsPercent > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  background: "rgba(34,211,238,0.15)",
                  color: "#22D3EE",
                }}
              >
                {t("signup.plan.savePercent", { percent: vm.annualSavingsPercent }) ||
                  `Save ${vm.annualSavingsPercent}%`}
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Error */}
      {vm.error && (
        <div
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-[13px] font-medium text-destructive">{vm.error}</p>
        </div>
      )}

      {/* Plan cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {vm.editions.map((edition, index) => {
          const price =
            vm.billingCycle === "monthly"
              ? edition.monthlyPrice
              : edition.annualPrice;
          const isFree = price === 0 && edition.tierLevel === 0;
          const isContactSales = edition.checkoutMode === "contact-sales";

          return (
            <div
              key={edition.id || index}
              className="relative flex flex-col rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,12,46,0.6), rgba(10,8,28,0.7))",
                border: edition.badge
                  ? "1px solid rgba(168,85,247,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
                animation: `sxRise 500ms cubic-bezier(.22,.61,.36,1) ${index * 60}ms both`,
              }}
            >
              {/* Badge */}
              {edition.badge && (
                <div className="absolute -top-2.5 start-4">
                  <Badge
                    variant="default"
                    className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase"
                    style={{
                      background:
                        "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    {edition.badge}
                  </Badge>
                </div>
              )}

              {/* Name + tagline */}
              <h3
                className="text-base font-bold"
                style={{ color: "rgba(245,242,255,0.95)" }}
              >
                {edition.name}
              </h3>
              <p
                className="mt-0.5 text-xs"
                style={{ color: "rgba(245,242,255,0.5)" }}
              >
                {edition.tagline}
              </p>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-1">
                {isFree ? (
                  <span
                    className="text-2xl font-bold"
                    style={{ color: "rgba(245,242,255,0.95)" }}
                  >
                    {t("signup.plan.free") || "Free"}
                  </span>
                ) : isContactSales ? (
                  <span
                    className="text-lg font-bold"
                    style={{ color: "rgba(245,242,255,0.95)" }}
                  >
                    {t("signup.plan.custom") || "Custom pricing"}
                  </span>
                ) : (
                  <>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: "rgba(245,242,255,0.95)" }}
                    >
                      ${vm.billingCycle === "monthly" ? price : Math.round(price / 12)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "rgba(245,242,255,0.45)" }}
                    >
                      /{vm.billingCycle === "monthly"
                        ? (t("signup.plan.mo") || "mo")
                        : (t("signup.plan.mo") || "mo")}
                    </span>
                    {vm.billingCycle === "annual" && (
                      <span
                        className="ms-1 text-[10px]"
                        style={{ color: "rgba(245,242,255,0.35)" }}
                      >
                        ({t("signup.plan.billedAnnually") || `$${price}/yr`})
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Trial info */}
              {edition.trialDays && !isFree && !isContactSales && (
                <p
                  className="mt-1 text-[11px] font-medium"
                  style={{ color: "#22D3EE" }}
                >
                  {t("signup.plan.trialDays", { days: edition.trialDays }) ||
                    `${edition.trialDays}-day free trial`}
                </p>
              )}

              {/* Features */}
              <ul className="mt-4 flex-1 space-y-2">
                {edition.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-xs">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="mt-0.5 shrink-0"
                    >
                      <path
                        d="M3 7L6 10L11 4"
                        stroke="#A855F7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span style={{ color: "rgba(245,242,255,0.7)" }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                type="button"
                className="mt-5 w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-200"
                onClick={() => vm.selectPlan(edition)}
                style={{
                  background: edition.badge
                    ? "linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #6366F1 100%)"
                    : "rgba(255,255,255,0.06)",
                  color: edition.badge ? "#fff" : "rgba(245,242,255,0.8)",
                  border: edition.badge
                    ? "none"
                    : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {isContactSales
                  ? (t("signup.plan.contactSales") || "Talk to Sales")
                  : isFree
                    ? (t("signup.plan.startFree") || "Start Free")
                    : (t("signup.plan.choosePlan", { plan: edition.name }) ||
                        `Choose ${edition.name}`)}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Compare all features link */}
      <div className="text-center">
        <Button
          variant="link"
          type="button"
          className="text-xs font-medium underline underline-offset-2 transition-colors duration-150"
          style={{ color: "rgba(245,242,255,0.45)" }}
        >
          {t("signup.plan.compareAll") || "Compare all features"}
        </Button>
      </div>
    </div>
  );
}
