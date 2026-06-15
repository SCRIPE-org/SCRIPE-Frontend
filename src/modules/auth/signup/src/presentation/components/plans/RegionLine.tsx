"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { MapPin } from "lucide-react";
import { countryToFlag } from "../../../data/helpers/currencyGeo";

// ═══════════════════════════════════════════════════════════════════════════
// RegionLine — a single quiet line: "Prices in {currency} · {country}".
//
// This REPLACES the old "US $ USD" currency pill entirely. Currency is
// server/geo-locked (PRODUCT.md: not user-switchable), and the data layer
// exposes NO region/country setter — so per the F4 brief we render only the
// informational line, with NO dropdown and NO "Change region" affordance.
// If a real region-change API lands later, the affordance can be added here.
//
// Pure UI — currency + country come from the viewmodel.
// ═══════════════════════════════════════════════════════════════════════════

interface RegionLineProps {
  currency: string;
  /** ISO 3166-1 alpha-2 country, or null when geo-detection was inconclusive. */
  detectedCountry: string | null;
}

export function RegionLine({ currency, detectedCountry }: RegionLineProps) {
  const { t } = useI18n();
  const { tokens } = useSignupTheme();

  const flag = detectedCountry ? countryToFlag(detectedCountry) : null;

  return (
    <p className="inline-flex items-center gap-1.5 text-[0.75rem]" style={{ color: tokens.inkFaint }}>
      <MapPin size={12} aria-hidden />
      <span>
        {detectedCountry
          ? t("signup.plans.region.line", { currency, country: detectedCountry })
          : t("signup.plans.region.lineNoCountry", { currency })}
      </span>
      {flag && (
        <span aria-hidden className="leading-none">
          {flag}
        </span>
      )}
    </p>
  );
}
