"use client";

import { Fragment, useEffect, useRef } from "react";
import { X, Check, Minus, Infinity } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import type { PlanEdition, FeatureCategory } from "../viewmodels/usePlanPickerViewModel";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  editions: PlanEdition[];
  categories: FeatureCategory[];
  billingCycle: "monthly" | "annual";
  onSelectPlan: (edition: PlanEdition) => void;
}

function FeatureValue({ featureName, edition }: { featureName: string; edition: PlanEdition }) {
  const { t, language } = useI18n();
  const feat = edition.allFeatures.find((f) => f.name === featureName);

  if (!feat) {
    return (
      <span className="flex items-center justify-center">
        <Minus className="h-4 w-4" style={{ color: "rgba(245,242,255,0.2)" }} />
      </span>
    );
  }

  const { valueType, value } = feat;

  // If there's a display label, use it for the value cell (overrides raw value rendering)
  const displayLabel =
    language === "ar" && feat.displayLabelAr
      ? feat.displayLabelAr
      : feat.displayLabelEn ?? null;

  if (displayLabel) {
    return (
      <span
        className="max-w-[160px] text-center text-xs leading-snug font-medium"
        style={{ color: "rgba(245,242,255,0.85)" }}
      >
        {displayLabel}
      </span>
    );
  }

  if (valueType === "Boolean") {
    const isTrue = value === "true" || value === "1";
    return (
      <span className="flex items-center justify-center">
        {isTrue ? (
          <Check
            className="h-4 w-4"
            style={{ color: "#A855F7" }}
            aria-label={t("common.yes") || "Yes"}
          />
        ) : (
          <Minus
            className="h-4 w-4"
            style={{ color: "rgba(245,242,255,0.2)" }}
            aria-label={t("common.no") || "No"}
          />
        )}
      </span>
    );
  }

  if (valueType === "Numeric") {
    const num = parseInt(value, 10);
    if (num === -1) {
      return (
        <span className="flex items-center justify-center gap-1">
          <Infinity
            className="h-4 w-4"
            style={{ color: "#22D3EE" }}
            aria-label={t("common.unlimited") || "Unlimited"}
          />
        </span>
      );
    }
    return (
      <span
        className="text-sm font-semibold tabular-nums"
        style={{ color: "rgba(245,242,255,0.9)" }}
      >
        {num.toLocaleString()}
      </span>
    );
  }

  // Text
  return (
    <span
      className="max-w-[140px] text-center text-xs leading-snug"
      style={{ color: "rgba(245,242,255,0.75)" }}
    >
      {value}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FeatureComparisonModal — Full-screen comparison table for all plan features.
 *
 * - Categorized rows matching Feature.Category grouping
 * - Value rendering: Boolean (✓/–), Numeric (10, ∞), Text (custom strings)
 * - Sticky header row with edition names + pricing
 * - CTA button per edition column
 * - Glassmorphic dark design matching the signup theme
 */
export function FeatureComparisonModal({
  isOpen,
  onClose,
  editions,
  categories,
  billingCycle,
  onSelectPlan,
}: FeatureComparisonModalProps) {
  const { t, language } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Keyboard close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const colWidth = Math.max(140, Math.floor(680 / editions.length));

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={t("signup.plan.compareAll") || "Compare all features"}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl"
        style={{
          margin: "24px 16px",
          maxHeight: "calc(100dvh - 48px)",
          background: "linear-gradient(180deg, rgba(18,10,40,0.98) 0%, rgba(8,6,24,0.99) 100%)",
          border: "1px solid rgba(168,85,247,0.25)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex shrink-0 items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: "rgba(245,242,255,0.95)" }}
            >
              {t("signup.plan.compareTitle") || "Compare all plans"}
            </h2>
            <p
              className="mt-0.5 text-xs"
              style={{ color: "rgba(245,242,255,0.45)" }}
            >
              {t("signup.plan.compareSubtitle") || "See exactly what's included in each plan"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
            style={{ color: "rgba(245,242,255,0.5)" }}
            aria-label={t("common.close") || "Close"}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ── Scrollable table ── */}
        <div ref={scrollRef} className="flex-1 overflow-auto">
          <table className="w-full border-collapse" style={{ minWidth: `${160 + colWidth * editions.length}px` }}>

            {/* ── Sticky column header with edition names ── */}
            <thead className="sticky top-0 z-20">
              <tr style={{ background: "rgba(14,8,36,0.98)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {/* Feature label column */}
                <th
                  className="w-44 px-6 py-4 text-start text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(245,242,255,0.35)", minWidth: "160px" }}
                >
                  {t("signup.plan.feature") || "Feature"}
                </th>

                {/* Edition columns */}
                {editions.map((edition) => {
                  const price =
                    billingCycle === "monthly"
                      ? edition.monthlyPrice
                      : edition.annualPrice
                        ? Math.round(edition.annualPrice / 12)
                        : 0;
                  const isFree = price === 0 && edition.tierLevel === 0;

                  return (
                    <th
                      key={edition.id || edition.name}
                      className="px-4 py-4 text-center"
                      style={{ minWidth: `${colWidth}px` }}
                    >
                      {/* Badge */}
                      {edition.badge && (
                        <div className="mb-1 flex justify-center">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase"
                            style={{
                              background: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)",
                              color: "#fff",
                            }}
                          >
                            {edition.badge}
                          </span>
                        </div>
                      )}

                      {/* Name */}
                      <div
                        className="text-sm font-bold"
                        style={{ color: "rgba(245,242,255,0.95)" }}
                      >
                        {edition.name}
                      </div>

                      {/* Price */}
                      <div className="mt-1 flex items-baseline justify-center gap-0.5">
                        {isFree ? (
                          <span className="text-base font-bold" style={{ color: "rgba(245,242,255,0.9)" }}>
                            {t("signup.plan.free") || "Free"}
                          </span>
                        ) : edition.checkoutMode === "contact-sales" ? (
                          <span className="text-xs" style={{ color: "rgba(245,242,255,0.6)" }}>
                            {t("signup.plan.custom") || "Custom"}
                          </span>
                        ) : (
                          <>
                            <span className="text-base font-bold" style={{ color: "rgba(245,242,255,0.9)" }}>
                              ${price}
                            </span>
                            <span className="text-[10px]" style={{ color: "rgba(245,242,255,0.4)" }}>
                              /{t("signup.plan.mo") || "mo"}
                            </span>
                          </>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="mt-3">
                        <Button
                          size="sm"
                          className="w-full rounded-lg py-1.5 text-xs font-semibold"
                          onClick={() => { onSelectPlan(edition); onClose(); }}
                          style={{
                            background: edition.badge
                              ? "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)"
                              : "rgba(255,255,255,0.07)",
                            color: edition.badge ? "#fff" : "rgba(245,242,255,0.8)",
                            border: edition.badge ? "none" : "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {edition.checkoutMode === "contact-sales"
                            ? (t("signup.plan.contactSales") || "Talk to Sales")
                            : isFree
                              ? (t("signup.plan.startFree") || "Start Free")
                              : (t("signup.plan.choosePlan", { plan: edition.name }) || `Choose ${edition.name}`)}
                        </Button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* ── Feature rows grouped by category ── */}
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={editions.length + 1}
                    className="px-6 py-12 text-center text-sm"
                    style={{ color: "rgba(245,242,255,0.4)" }}
                  >
                    {t("signup.plan.noFeatures") || "No features configured yet. Add features in the admin panel."}
                  </td>
                </tr>
              ) : (
                categories.map((cat, catIdx) => (
                  <Fragment key={`cat-section-${cat.name}`}>
                    {/* Category header row */}
                    <tr
                      key={`cat-${cat.name}`}
                      style={{
                        background: catIdx % 2 === 0
                          ? "rgba(168,85,247,0.05)"
                          : "rgba(255,255,255,0.02)",
                        borderTop: catIdx > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined,
                      }}
                    >
                      <td
                        className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest"
                        colSpan={editions.length + 1}
                        style={{ color: "rgba(168,85,247,0.8)" }}
                      >
                        {cat.name}
                      </td>
                    </tr>

                    {/* Feature rows */}
                    {cat.features.map((feat, featIdx) => (
                      <tr
                        key={`feat-${feat.name}-${featIdx}`}
                        className="group transition-colors duration-150"
                        style={{
                          background: catIdx % 2 === 0
                            ? featIdx % 2 === 0
                              ? "rgba(255,255,255,0.015)"
                              : "rgba(255,255,255,0.025)"
                            : featIdx % 2 === 0
                              ? "rgba(255,255,255,0.01)"
                              : "rgba(255,255,255,0.02)",
                        }}
                      >
                        {/* Feature name */}
                        <td
                          className="px-6 py-3 text-xs"
                          style={{ color: "rgba(245,242,255,0.65)", minWidth: "160px" }}
                          title={feat.description ?? undefined}
                        >
                          <span className="group-hover:text-white/90 transition-colors">
                            {language === "ar" && feat.nameAr ? feat.nameAr : feat.name}
                          </span>
                          {feat.description && (
                            <span
                              className="ml-1 cursor-help text-[10px]"
                              style={{ color: "rgba(245,242,255,0.3)" }}
                              title={feat.description}
                            >
                              ⓘ
                            </span>
                          )}
                        </td>

                        {/* Value per edition */}
                        {editions.map((edition) => (
                          <td
                            key={`${edition.id}-${feat.name}`}
                            className="px-4 py-3 text-center"
                            style={{ minWidth: `${colWidth}px` }}
                          >
                            <FeatureValue featureName={feat.name} edition={edition} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        <div
          className="flex shrink-0 items-center justify-center px-6 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p className="text-[11px]" style={{ color: "rgba(245,242,255,0.3)" }}>
            {t("signup.plan.comparePricesNote") ||
              "All prices shown in USD. Annual billing billed as a single payment."}
          </p>
        </div>
      </div>
    </div>
  );
}
