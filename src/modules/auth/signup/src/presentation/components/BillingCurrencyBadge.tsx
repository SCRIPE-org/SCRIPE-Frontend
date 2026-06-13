"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { MapPin } from "lucide-react";
import type { SupportedCurrency } from "../../domain/entities";
import { currencyFlag } from "../../data/helpers/currencyGeo";

interface BillingCurrencyBadgeProps {
  /** The locked display currency (ISO 4217), resolved from the visitor's country. */
  currency: string;
  /** Currency metadata (symbol + localized name) from the pricing-context API. */
  supportedCurrencies: SupportedCurrency[];
  /** Geo-detected country code — shows a "Detected" pill when present. */
  detectedCountry?: string | null;
  /** Whether the pricing context is still loading. */
  isLoading?: boolean;
}

/**
 * Read-only billing currency indicator.
 *
 * The signup currency is HARD-LOCKED to the visitor's detected country (resolved
 * server-side and re-validated at checkout) — there is no manual switcher by design.
 * This component only communicates which currency is in effect and why.
 */
export function BillingCurrencyBadge({
  currency,
  supportedCurrencies,
  detectedCountry,
  isLoading = false,
}: BillingCurrencyBadgeProps) {
  const { t, language } = useI18n();

  const meta = useMemo(
    () =>
      supportedCurrencies.find((c) => c.code === currency) ?? {
        code: currency,
        symbol: currency,
        nameEn: currency,
        nameAr: currency,
        rateFromUsd: 1,
      },
    [supportedCurrencies, currency]
  );

  const name = language === "ar" ? meta.nameAr : meta.nameEn;

  if (isLoading) {
    return (
      <div
        className="h-9 w-44 animate-pulse rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex items-center gap-2.5 rounded-full px-4 py-2 text-sm"
        title={name}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(245,242,255,0.75)",
        }}
      >
        <span className="text-base leading-none" aria-hidden="true">
          {currencyFlag(currency)}
        </span>
        <span className="font-semibold tracking-tight">{meta.symbol}</span>
        <span className="font-medium">{currency}</span>

        {detectedCountry && (
          <span
            className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{
              background: "rgba(34,197,94,0.15)",
              color: "#4ade80",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <MapPin className="h-2 w-2" aria-hidden="true" />
            {t("signup.plan.detected") || "Detected"}
          </span>
        )}
      </div>

      <p className="text-[11px]" style={{ color: "rgba(245,242,255,0.3)" }}>
        {t("signup.plan.currencyLockedNote", { currency }) ||
          `Prices shown in ${currency}, based on your location`}
      </p>
    </div>
  );
}
