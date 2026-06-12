"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Skeleton } from "@core/ui/skeleton";
import { ChevronDown } from "lucide-react";
import { usePlanPickerViewModel, type PlanEdition } from "../viewmodels/usePlanPickerViewModel";
import { PlanCard } from "./PlanCard";
import { authContainer } from "@modules/auth/di";

import { Button } from "@core/ui/button";

import type { PublicEdition } from "../../domain/entities";

const SUPPORTED_CURRENCIES = ["USD", "EUR", "SAR"] as const;

interface PlanPickerStepProps {
  onSelectPlan: (edition: PublicEdition, billingCycle: "monthly" | "annual") => void;
  /** Pre-selected category key from CategoryStep (null = all) */
  initialCategory?: string | null;
  /** Display + checkout currency — owned by the wizard (defaults SAR for Arabic; U1) */
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

/**
 * Groups editions by their category for the "All" view.
 * Returns an ordered array of { category, label, editions } objects.
 */
function groupEditionsByCategory(editions: PlanEdition[]) {
  const CATEGORY_DISPLAY_ORDER = ["general", "erp", "healthcare", "education", "finance"];
  const groups = new Map<string, { label: string; editions: PlanEdition[] }>();

  for (const ed of editions) {
    const cat = ed.category || "general";
    if (!groups.has(cat)) {
      groups.set(cat, { label: ed.categoryDisplayName ?? cat, editions: [] });
    }
    groups.get(cat)!.editions.push(ed);
  }

  // Sort each group internally by tier level
  for (const group of groups.values()) {
    group.editions.sort((a, b) => a.tierLevel - b.tierLevel);
  }

  // Sort categories by display order
  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      const ai = CATEGORY_DISPLAY_ORDER.indexOf(a);
      const bi = CATEGORY_DISPLAY_ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    })
    .map(([category, group]) => ({ category, label: group.label, editions: group.editions }));
}

export function PlanPickerStep({
  onSelectPlan,
  initialCategory,
  currency,
  onCurrencyChange,
}: PlanPickerStepProps) {
  const { t } = useI18n();
  const vm = usePlanPickerViewModel(authContainer.signupRepository, onSelectPlan, initialCategory ?? null, currency);
  const [showComparison, setShowComparison] = useState(false);

  // Group editions by category for the "All" view
  const groupedEditions = useMemo(
    () => groupEditionsByCategory(vm.filteredEditions),
    [vm.filteredEditions]
  );

  const showCategoryHeaders = !vm.activeCategory && groupedEditions.length > 1;

  // ── Loading ──
  if (vm.isLoading) {
    return (
      <div className="space-y-10">
        <div className="text-center">
          <Skeleton className="mx-auto h-10 w-64" />
          <Skeleton className="mx-auto mt-3 h-5 w-80" />
        </div>
        <div className="mx-auto flex flex-wrap justify-center gap-6 max-w-7xl">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[420px] rounded-2xl w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[280px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16" dir={vm.direction}>
      {/* ═══ Header ═══ */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {t("signup.plan.title") || "Choose your plan"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-white/45 sm:text-lg">
          {t("signup.plan.subtitle") || "From startups to enterprises, we've got you covered."}
        </p>
      </div>

      {/* ═══ Category tabs ═══ */}
      {vm.categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[null, ...vm.categories].map((cat) => {
            const isActive = vm.activeCategory === cat;
            return (
              <button
                key={cat ?? "__all"}
                type="button"
                onClick={() => vm.setActiveCategory(cat)}
                className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-200"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(124,58,237,0.18))"
                    : "rgba(255,255,255,0.04)",
                  color: isActive ? "rgba(245,242,255,0.95)" : "rgba(245,242,255,0.45)",
                  border: isActive
                    ? "1px solid rgba(168,85,247,0.5)"
                    : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {cat === null
                  ? t("signup.plan.allCategories") || "All"
                  : vm.categoryLabels[cat] ?? cat}
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ Billing toggle + Currency picker ═══ */}
      <div className="flex flex-col items-center justify-center gap-4">
        {vm.filteredEditions.some((e) => e.monthlyPrice > 0) && (
          <div
            className="inline-flex items-center rounded-full p-1"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {(["monthly", "annual"] as const).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => vm.setBillingCycle(cycle)}
                className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300"
                style={{
                  background:
                    vm.billingCycle === cycle
                      ? "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(124,58,237,0.2))"
                      : "transparent",
                  color:
                    vm.billingCycle === cycle ? "rgba(245,242,255,0.95)" : "rgba(245,242,255,0.4)",
                }}
              >
                {cycle === "monthly"
                  ? t("signup.plan.monthly") || "Monthly"
                  : t("signup.plan.annual") || "Annual"}
                {cycle === "annual" && vm.annualSavingsPercent > 0 && (
                  <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                    {t("signup.plan.savePercent", { percent: vm.annualSavingsPercent }) ||
                      `Save ${vm.annualSavingsPercent}%`}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Currency pills (U1) — changing refetches prices in the chosen currency */}
        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-center rounded-full p-1"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {SUPPORTED_CURRENCIES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onCurrencyChange(code)}
                className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200"
                style={{
                  background:
                    currency === code
                      ? "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.1))"
                      : "transparent",
                  color: currency === code ? "#22D3EE" : "rgba(245,242,255,0.4)",
                  border:
                    currency === code
                      ? "1px solid rgba(34,211,238,0.35)"
                      : "1px solid transparent",
                }}
                aria-pressed={currency === code}
              >
                {code}
              </button>
            ))}
          </div>
          <span className="text-[11px]" style={{ color: "rgba(245,242,255,0.35)" }}>
            {t("signup.plan.currencyNote", { currency }) || `Prices shown in ${currency}`}
          </span>
        </div>
      </div>

      {/* ═══ Error ═══ */}
      {vm.error && (
        <div
          className="mx-auto max-w-lg rounded-xl border border-destructive/20 bg-destructive/10 px-5 py-3.5"
          role="alert"
        >
          <p className="text-sm font-medium text-destructive">{vm.error}</p>
        </div>
      )}

      {/* ═══ Plan cards — Category-grouped with pro section headers ═══ */}
      {showCategoryHeaders ? (
        // "All" view: group editions by category with beautiful section headers
        <div className="space-y-16">
          {groupedEditions.map(({ category, label, editions }) => (
            <div key={category}>
              {/* Category section header */}
              <div className="mb-8 flex items-center gap-4">
                <div
                  className="h-px flex-1"
                  style={{
                    background: "linear-gradient(90deg, rgba(168,85,247,0.3), transparent)",
                  }}
                />
                <h2
                  className="shrink-0 text-sm font-bold uppercase tracking-[0.2em]"
                  style={{ color: "rgba(168,85,247,0.7)" }}
                >
                  {label}
                </h2>
                <div
                  className="h-px flex-1"
                  style={{
                    background: "linear-gradient(270deg, rgba(168,85,247,0.3), transparent)",
                  }}
                />
              </div>

              {/* Edition cards within category */}
              <div className="mx-auto flex flex-wrap justify-center gap-5 max-w-7xl">
                {editions.map((edition, idx) => (
                  <div key={edition.id || idx} className="w-full sm:w-[calc(50%-10px)] lg:w-[320px] flex">
                    <PlanCard
                      edition={edition}
                      index={idx}
                      prevEditionName={idx > 0 ? editions[idx - 1]?.name : null}
                      billingCycle={vm.billingCycle}
                      onSelect={vm.selectPlan}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Single category or filtered view: flat grid with gap
        <div className="mx-auto flex flex-wrap justify-center gap-5 max-w-7xl">
          {vm.filteredEditions.map((edition, idx) => (
            <div key={edition.id || idx} className="w-full sm:w-[calc(50%-10px)] lg:w-[320px] flex">
              <PlanCard
                edition={edition}
                index={idx}
                prevEditionName={idx > 0 ? vm.filteredEditions[idx - 1]?.name : null}
                billingCycle={vm.billingCycle}
                onSelect={vm.selectPlan}
              />
            </div>
          ))}
        </div>
      )}

      {/* ═══ Full comparison table Collapsible Toggle ═══ */}
      <div className="flex flex-col items-center justify-center pt-4">
        <Button
          type="button"
          onClick={() => setShowComparison((prev) => !prev)}
          variant="ghost"
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-6 py-5 text-sm font-semibold text-white/70 hover:bg-white/[0.05] hover:text-white"
        >
          {showComparison
            ? t("signup.plan.hideComparison") || "Hide full feature comparison"
            : t("signup.plan.showComparison") || "Compare all plans & features"}
          <ChevronDown
            className={`h-4 w-4 text-white/45 transition-transform duration-300 ${
              showComparison ? "rotate-180" : "rotate-0"
            }`}
          />
        </Button>
      </div>

      {showComparison && (
        <div className="space-y-8" style={{ animation: "sxSlideIn 300ms ease-out both" }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white/90 sm:text-3xl">
              {t("signup.plan.compareAll") || "Compare all features"}
            </h2>
            <p className="mt-2 text-sm text-white/40 sm:text-base">
              {t("signup.plan.compareSubtitle") ||
                "A detailed breakdown of what's included in every plan."}
            </p>
          </div>

          {/* Category picker for comparison — only when multiple categories exist */}
          {vm.categories.length > 1 && (
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-2">
              {vm.categories.map((cat) => {
                const isActive = vm.comparisonActiveCategory === cat;
                return (
                  <button
                    key={`cmp-${cat}`}
                    type="button"
                    onClick={() => vm.setComparisonActiveCategory(cat)}
                    className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-200"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(124,58,237,0.18))"
                        : "rgba(255,255,255,0.03)",
                      color: isActive ? "rgba(245,242,255,0.95)" : "rgba(245,242,255,0.35)",
                      border: isActive
                        ? "1px solid rgba(168,85,247,0.45)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {vm.categoryLabels[cat] ?? cat}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
