"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import type { PublicEdition } from "../../domain/entities";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Internal enriched edition type for card rendering */
export interface PlanEdition {
  id: string;
  name: string;
  tagline: string;
  tierLevel: number;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  trialDays: number | null;
  badge: string | null;
  features: string[];
  checkoutMode: "self-service" | "contact-sales";
}

export interface UsePlanPickerViewModelReturn {
  // State
  editions: PlanEdition[];
  isLoading: boolean;
  error: string;
  billingCycle: "monthly" | "annual";
  annualSavingsPercent: number;
  direction: string;

  // Actions
  setBillingCycle: (cycle: "monthly" | "annual") => void;
  selectPlan: (edition: PlanEdition) => void;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

/** Maps API PublicEdition → internal PlanEdition for card rendering */
function mapEdition(e: PublicEdition): PlanEdition {
  return {
    id: e.id,
    name: e.name,
    tagline: e.tagline ?? "",
    tierLevel: e.tier,
    monthlyPrice: e.monthlyPrice ?? 0,
    annualPrice: e.annualPrice ?? 0,
    currency: e.currency,
    trialDays: e.trialDays > 0 ? e.trialDays : null,
    badge: e.badge ?? (e.isRecommended ? "Recommended" : null),
    features: e.topFeatures ?? [],
    checkoutMode: e.checkoutMode === "contact-sales" ? "contact-sales" : "self-service",
  };
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

/**
 * usePlanPickerViewModel — Business logic for the Plan Picker signup step.
 *
 * Extracted from PlanPickerStep.tsx to enforce SCRIPE MVVM architecture:
 * View → ViewModel → Repository → Service → HTTP
 *
 * Per tenant-signup.md §2 Step 1:
 * - Fetches editions from signupRepository
 * - Manages billing cycle toggle
 * - Calculates annual savings percentage
 * - Maps editions for card rendering
 * - Falls back to a free plan if the API call fails
 */
export function usePlanPickerViewModel(
  onSelectPlan: (
    edition: { id: string; name: string; trialDays: number | null; checkoutMode: string },
    billingCycle: "monthly" | "annual"
  ) => void
): UsePlanPickerViewModelReturn {
  const { t, direction } = useI18n();
  const { signupRepository } = authContainer;

  const [editions, setEditions] = useState<PlanEdition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  // ── Fetch editions on mount ──
  useEffect(() => {
    let cancelled = false;
    const fetchEditions = async () => {
      setIsLoading(true);
      try {
        const result = await signupRepository.getEditions();
        if (!cancelled) {
          setEditions(result.map(mapEdition));
        }
      } catch {
        if (!cancelled) {
          // Fallback: show a minimal free plan so user can proceed
          setEditions([
            {
              id: "",
              name: "Free",
              tagline: t("signup.plan.freeTagline") || "Get started for free",
              tierLevel: 0,
              monthlyPrice: 0,
              annualPrice: 0,
              currency: "USD",
              trialDays: null,
              badge: null,
              features: [
                t("signup.plan.features.basic") || "Basic features",
                t("signup.plan.features.singleAdmin") || "1 admin user",
                t("signup.plan.features.communitySupport") || "Community support",
              ],
              checkoutMode: "self-service",
            },
          ]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchEditions();
    return () => { cancelled = true; };
  }, [signupRepository, t]);

  // ── Computed: annual savings ──
  const annualSavingsPercent = useMemo(() => {
    const first = editions.find((e) => e.monthlyPrice > 0);
    if (!first) return 0;
    const monthlyTotal = first.monthlyPrice * 12;
    const annualTotal = first.annualPrice;
    if (monthlyTotal <= 0) return 0;
    return Math.round(((monthlyTotal - annualTotal) / monthlyTotal) * 100);
  }, [editions]);

  // ── Select plan ──
  const selectPlan = useCallback(
    (edition: PlanEdition) => {
      onSelectPlan(edition, billingCycle);
    },
    [billingCycle, onSelectPlan]
  );

  return {
    editions,
    isLoading,
    error,
    billingCycle,
    annualSavingsPercent,
    direction,
    setBillingCycle,
    selectPlan,
  };
}
