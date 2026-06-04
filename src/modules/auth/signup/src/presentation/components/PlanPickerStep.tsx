"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Skeleton } from "@core/ui/skeleton";
import { usePlanPickerViewModel, type PlanEdition } from "../viewmodels/usePlanPickerViewModel";
import { PlanCard } from "./PlanCard";
import { ComparisonTable } from "./ComparisonTable";

interface PlanPickerStepProps {
  onSelectPlan: (
    edition: { id: string; name: string; trialDays: number | null; checkoutMode: string },
    billingCycle: "monthly" | "annual"
  ) => void;
}

/**
 * Groups editions by their category for the "All" view.
 * Returns an ordered array of { category, editions } objects.
 */
function groupEditionsByCategory(editions: PlanEdition[]) {
  const CATEGORY_DISPLAY_ORDER = ["General", "ERP", "Healthcare", "Education", "Finance"];
  const groups = new Map<string, PlanEdition[]>();

  for (const ed of editions) {
    const cat = ed.category || "General";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(ed);
  }

  // Sort each group internally by tier level
  for (const editions of groups.values()) {
    editions.sort((a, b) => a.tierLevel - b.tierLevel);
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
    .map(([category, editions]) => ({ category, editions }));
}

export function PlanPickerStep({ onSelectPlan }: PlanPickerStepProps) {
  const { t } = useI18n();
  const vm = usePlanPickerViewModel(onSelectPlan);

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[420px] rounded-2xl" />
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
                {cat ?? (t("signup.plan.allCategories") || "All")}
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ Billing toggle ═══ */}
      {vm.filteredEditions.some((e) => e.monthlyPrice > 0) && (
        <div className="flex items-center justify-center">
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
        </div>
      )}

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
          {groupedEditions.map(({ category, editions }) => (
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
                  {category}
                </h2>
                <div
                  className="h-px flex-1"
                  style={{
                    background: "linear-gradient(270deg, rgba(168,85,247,0.3), transparent)",
                  }}
                />
              </div>

              {/* Edition cards within category */}
              <div
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                style={{
                  gridTemplateColumns:
                    editions.length <= 3 ? `repeat(${editions.length}, minmax(0, 1fr))` : undefined,
                }}
              >
                {editions.map((edition, idx) => (
                  <PlanCard
                    key={edition.id || idx}
                    edition={edition}
                    index={idx}
                    prevEditionName={idx > 0 ? editions[idx - 1]?.name : null}
                    billingCycle={vm.billingCycle}
                    onSelect={vm.selectPlan}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Single category or filtered view: flat grid with gap
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vm.filteredEditions.map((edition, idx) => (
            <PlanCard
              key={edition.id || idx}
              edition={edition}
              index={idx}
              prevEditionName={idx > 0 ? vm.filteredEditions[idx - 1]?.name : null}
              billingCycle={vm.billingCycle}
              onSelect={vm.selectPlan}
            />
          ))}
        </div>
      )}

      {/* ═══ Full comparison table — always visible like Vercel ═══ */}
      <div>
        <div className="mb-8 text-center">
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
          <div className="mx-auto mb-6 flex max-w-[1400px] flex-wrap items-center justify-center gap-2">
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
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        <div
          className="mx-auto max-w-[1400px] overflow-hidden rounded-2xl"
          style={{
            background: "rgba(8,5,22,0.5)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <ComparisonTable
            editions={vm.comparisonEditions}
            categories={vm.comparisonCategories}
            billingCycle={vm.billingCycle}
            onSelectPlan={vm.selectPlan}
          />
        </div>
      </div>
    </div>
  );
}
