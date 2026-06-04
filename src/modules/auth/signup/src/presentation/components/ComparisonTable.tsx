"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  Check,
  Minus,
  ChevronDown,
  Shield,
  Users,
  Boxes,
  Gauge,
  Settings,
  Headphones,
  LayoutGrid,
  Zap,
} from "lucide-react";
import type { PlanEdition } from "../viewmodels/usePlanPickerViewModel";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComparisonCategory {
  key: string;
  label: string;
  features: {
    featureName: string;
    label: string;
    values: Record<string, ComparisonCellData>;
  }[];
}

interface ComparisonCellData {
  value: string;
  valueType: string;
  displayLabelEn: string | null;
  displayLabelAr: string | null;
}

interface ComparisonTableProps {
  editions: PlanEdition[];
  categories: ComparisonCategory[];
  billingCycle: "monthly" | "annual";
  onSelectPlan: (edition: PlanEdition) => void;
}

// ─── Category Icon + Color Map ────────────────────────────────────────────────

const CATEGORY_META: Record<string, { icon: React.ElementType; gradient: string }> = {
  "Users & Access": { icon: Users, gradient: "from-blue-500/10 to-blue-500/0" },
  Modules: { icon: Boxes, gradient: "from-violet-500/10 to-violet-500/0" },
  Security: { icon: Shield, gradient: "from-emerald-500/10 to-emerald-500/0" },
  Performance: { icon: Gauge, gradient: "from-orange-500/10 to-orange-500/0" },
  Configuration: { icon: Settings, gradient: "from-slate-400/10 to-slate-400/0" },
  Support: { icon: Headphones, gradient: "from-pink-500/10 to-pink-500/0" },
  Quotas: { icon: Zap, gradient: "from-amber-500/10 to-amber-500/0" },
  General: { icon: LayoutGrid, gradient: "from-indigo-500/10 to-indigo-500/0" },
  Billing: { icon: Settings, gradient: "from-cyan-500/10 to-cyan-500/0" },
};

function getCategoryMeta(key: string) {
  return CATEGORY_META[key] ?? { icon: LayoutGrid, gradient: "from-white/5 to-white/0" };
}

// ─── Value Cell Renderer (Vercel-style: ✓ / — / value) ───────────────────────

function ValueCell({ data, language }: { data: ComparisonCellData | undefined; language: string }) {
  if (!data) {
    return (
      <td className="px-4 py-4 text-center">
        <Minus className="mx-auto h-4 w-4 text-white/15" aria-label="Not available" />
      </td>
    );
  }

  const { value, valueType, displayLabelEn, displayLabelAr } = data;
  const displayLabel = language === "ar" && displayLabelAr ? displayLabelAr : displayLabelEn;

  // Boolean features
  if (valueType === "Boolean") {
    const enabled = value === "true" || value === "1";
    return (
      <td className="px-4 py-4 text-center">
        {enabled ? (
          <div className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15">
            <Check className="h-3 w-3 text-emerald-400" aria-label="Included" />
          </div>
        ) : (
          <Minus className="mx-auto h-4 w-4 text-white/15" aria-label="Not included" />
        )}
      </td>
    );
  }

  // Numeric features
  if (valueType === "Numeric") {
    const num = parseInt(value, 10);
    if (isNaN(num) || num === 0) {
      return (
        <td className="px-4 py-4 text-center">
          <Minus className="mx-auto h-4 w-4 text-white/15" aria-label="Not available" />
        </td>
      );
    }

    if (displayLabel) {
      return (
        <td className="px-4 py-4 text-center">
          <span className="text-[13px] text-white/70">{displayLabel}</span>
        </td>
      );
    }

    if (num === -1) {
      return (
        <td className="px-4 py-4 text-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-400">
            {language === "ar" ? "غير محدود" : "Unlimited"}
          </span>
        </td>
      );
    }

    return (
      <td className="px-4 py-4 text-center">
        <span className="text-[13px] font-medium text-white/70">{num.toLocaleString()}</span>
      </td>
    );
  }

  // String features
  if (!value?.trim()) {
    return (
      <td className="px-4 py-4 text-center">
        <Minus className="mx-auto h-4 w-4 text-white/15" aria-label="Not available" />
      </td>
    );
  }

  return (
    <td className="px-4 py-4 text-center">
      <span className="text-[13px] text-white/70">{displayLabel || value}</span>
    </td>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────

function CategorySection({
  category,
  editions,
  language,
  isOpen,
  onToggle,
  colCount,
}: {
  category: ComparisonCategory;
  editions: PlanEdition[];
  language: string;
  isOpen: boolean;
  onToggle: () => void;
  colCount: number;
}) {
  const { icon: Icon, gradient } = getCategoryMeta(category.key);
  const featureCount = category.features.length;

  return (
    <>
      {/* Category header */}
      <tr>
        <td colSpan={colCount} className="p-0">
          <button
            type="button"
            onClick={onToggle}
            className={`flex w-full items-center gap-3 bg-gradient-to-r px-6 py-4 text-start transition-colors duration-200 hover:bg-white/[0.02] ${gradient} `}
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            aria-expanded={isOpen}
          >
            {/* Icon */}
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <Icon className="h-3.5 w-3.5 text-white/50" />
            </div>

            {/* Label */}
            <span className="text-sm font-semibold text-white/80">{category.label}</span>

            {/* Feature count pill */}
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-white/35">
              {featureCount} {featureCount === 1 ? "feature" : "features"}
            </span>

            {/* Spacer */}
            <span className="flex-1" />

            {/* Chevron */}
            <ChevronDown
              className={`h-4 w-4 text-white/30 transition-transform duration-300 ${
                isOpen ? "rotate-0" : "-rotate-90"
              }`}
            />
          </button>
        </td>
      </tr>

      {/* Feature rows — animated with CSS */}
      {isOpen &&
        category.features.map((feat, fi) => (
          <tr
            key={`${category.key}-${feat.featureName}`}
            className="group transition-colors duration-100 hover:bg-white/[0.02]"
            style={{
              borderBottom: fi < featureCount - 1 ? "1px solid rgba(255,255,255,0.025)" : "none",
              animation: `sxSlideIn 200ms ease-out ${fi * 20}ms both`,
            }}
          >
            <td className="px-6 py-3.5 ps-12 text-[13px] text-white/50 transition-colors group-hover:text-white/70">
              {feat.label}
            </td>
            {editions.map((ed) => (
              <ValueCell
                key={`${feat.featureName}-${ed.id}`}
                data={feat.values[ed.id]}
                language={language}
              />
            ))}
          </tr>
        ))}
    </>
  );
}

// ─── ComparisonTable ──────────────────────────────────────────────────────────

export function ComparisonTable({
  editions,
  categories,
  billingCycle,
  onSelectPlan,
}: ComparisonTableProps) {
  const { t, language } = useI18n();
  const colCount = editions.length + 1;

  // All categories open by default
  const [openCats, setOpenCats] = useState<Set<string>>(
    () => new Set(categories.map((c) => c.key))
  );

  const toggleCategory = useCallback((key: string) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setOpenCats(new Set(categories.map((c) => c.key)));
  }, [categories]);

  const collapseAll = useCallback(() => {
    setOpenCats(new Set());
  }, []);

  const allExpanded = useMemo(
    () => categories.every((c) => openCats.has(c.key)),
    [categories, openCats]
  );

  const totalFeatures = useMemo(
    () => categories.reduce((sum, c) => sum + c.features.length, 0),
    [categories]
  );

  if (!categories.length || !editions.length) {
    return (
      <div className="px-8 py-12 text-center text-sm text-white/30">
        {t("signup.plan.noFeatures") || "No features configured yet."}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* ─── Category Quick Nav ─── */}
      <div
        className="flex flex-wrap items-center gap-2 px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <span className="me-1 text-xs font-medium text-white/25">
          {totalFeatures} features in {categories.length} categories
        </span>
        <span className="text-white/10">•</span>
        <button
          type="button"
          onClick={allExpanded ? collapseAll : expandAll}
          className="text-xs font-medium text-white/35 transition-colors hover:text-white/60"
        >
          {allExpanded ? "Collapse all" : "Expand all"}
        </button>
        <span className="hidden text-white/10 sm:inline">•</span>
        <div className="hidden flex-wrap gap-1.5 sm:flex">
          {categories.map((cat) => {
            const { icon: Icon } = getCategoryMeta(cat.key);
            const isOpen = openCats.has(cat.key);
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => toggleCategory(cat.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                  isOpen
                    ? "bg-white/[0.08] text-white/60"
                    : "bg-white/[0.02] text-white/25 hover:bg-white/[0.05] hover:text-white/40"
                } `}
              >
                <Icon className="h-3 w-3" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[800px] border-collapse" role="table">
          {/* ─── Sticky header ─── */}
          <thead>
            {/* Plan name + price row */}
            <tr
              className="sticky top-0 z-20"
              style={{
                background: "rgba(8,5,22,0.97)",
                backdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <th
                className="px-6 py-5 text-start text-sm font-medium text-white/40"
                style={{ width: "30%", minWidth: "200px" }}
              >
                {t("signup.plan.feature") || "Features"}
              </th>
              {editions.map((ed) => {
                const isFree = ed.monthlyPrice === 0 && ed.tierLevel === 0;
                const isContact = ed.checkoutMode === "contact-sales";
                const isHighlighted = !!ed.badge;
                return (
                  <th
                    key={ed.id}
                    className="px-4 py-5 text-center"
                    style={{
                      width: `${70 / editions.length}%`,
                      minWidth: "140px",
                      background: isHighlighted ? "rgba(168,85,247,0.04)" : "transparent",
                    }}
                  >
                    <div className="text-sm font-bold text-white/90">{ed.name}</div>
                    <div className="mt-1 text-xs text-white/40">
                      {isFree
                        ? t("signup.plan.free") || "Free forever"
                        : isContact
                          ? t("signup.plan.custom") || "Custom"
                          : `$${billingCycle === "monthly" ? ed.monthlyPrice : Math.round(ed.annualPrice / 12)}/mo`}
                    </div>
                  </th>
                );
              })}
            </tr>

            {/* CTA row */}
            <tr
              style={{
                background: "rgba(8,5,22,0.93)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <td className="px-6 py-3" />
              {editions.map((ed) => {
                const isHighlighted = !!ed.badge;
                return (
                  <td key={`cta-${ed.id}`} className="px-4 py-3 text-center">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onSelectPlan(ed)}
                      className="rounded-lg px-4 py-2 text-xs font-semibold"
                      style={{
                        background: isHighlighted ? "#fff" : "transparent",
                        color: isHighlighted ? "#000" : "rgba(245,242,255,0.65)",
                        border: isHighlighted ? "none" : "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      {ed.checkoutMode === "contact-sales"
                        ? t("signup.plan.contactSales") || "Get a demo"
                        : ed.monthlyPrice === 0 && ed.tierLevel === 0
                          ? t("signup.plan.startFree") || "Start Deploying"
                          : t("signup.plan.choosePlan", { plan: ed.name }) || "Start a free trial"}
                    </Button>
                  </td>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <CategorySection
                key={`cat-${cat.key}`}
                category={cat}
                editions={editions}
                language={language}
                isOpen={openCats.has(cat.key)}
                onToggle={() => toggleCategory(cat.key)}
                colCount={colCount}
              />
            ))}
          </tbody>

          {/* ─── Footer CTA row ─── */}
          <tfoot>
            <tr style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <td className="px-6 py-8" />
              {editions.map((ed) => {
                const isHighlighted = !!ed.badge;
                return (
                  <td key={`foot-${ed.id}`} className="px-4 py-8 text-center">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onSelectPlan(ed)}
                      className="rounded-lg px-5 py-2.5 text-xs font-semibold"
                      style={{
                        background: isHighlighted ? "#fff" : "transparent",
                        color: isHighlighted ? "#000" : "rgba(245,242,255,0.65)",
                        border: isHighlighted ? "none" : "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      {ed.checkoutMode === "contact-sales"
                        ? t("signup.plan.contactSales") || "Get a demo"
                        : t("signup.plan.choosePlan", { plan: ed.name }) || `Choose ${ed.name}`}
                      <span className="ms-1">→</span>
                    </Button>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
