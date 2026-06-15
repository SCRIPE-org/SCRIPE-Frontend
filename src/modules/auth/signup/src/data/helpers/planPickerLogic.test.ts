// ═══════════════════════════════════════════════════════════════════════════
// planPickerLogic — focused unit tests for the pure plans-phase logic (F4).
//
// These exercise the rules the viewmodel + cards depend on, with no React:
//   • annual savings % from the cheapest paid edition;
//   • recommended-match via encrypted-id compare;
//   • CTA i18n-key mapping by checkout mode;
//   • Q3 priority derivation (excludes business_type, lowercased);
//   • Intl currency formatting (no hardcoded symbol) + approximate marker.
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  computeAnnualSavingsPercent,
  isRecommendedEdition,
  ctaKeyForCheckoutMode,
  derivePriorityKeys,
  deriveBusinessType,
  formatCurrency,
} from "./planPickerLogic";

describe("computeAnnualSavingsPercent", () => {
  it("computes savings from the first paid edition (20% off annual)", () => {
    const editions = [
      { monthlyPrice: 0, annualPrice: 0 }, // free — skipped
      { monthlyPrice: 100, annualPrice: 960 }, // 1200 vs 960 → 20%
      { monthlyPrice: 300, annualPrice: 2880 },
    ];
    expect(computeAnnualSavingsPercent(editions)).toBe(20);
  });

  it("returns 0 when there is no paid edition", () => {
    expect(computeAnnualSavingsPercent([{ monthlyPrice: 0, annualPrice: 0 }])).toBe(0);
  });

  it("returns 0 for an empty catalog", () => {
    expect(computeAnnualSavingsPercent([])).toBe(0);
  });
});

describe("isRecommendedEdition", () => {
  it("matches when the encrypted ids are identical", () => {
    expect(isRecommendedEdition("enc_abc", "enc_abc")).toBe(true);
  });

  it("does not match different ids", () => {
    expect(isRecommendedEdition("enc_abc", "enc_xyz")).toBe(false);
  });

  it("never matches when the recommendation is null/undefined/empty", () => {
    expect(isRecommendedEdition("enc_abc", null)).toBe(false);
    expect(isRecommendedEdition("enc_abc", undefined)).toBe(false);
    expect(isRecommendedEdition("enc_abc", "")).toBe(false);
  });
});

describe("ctaKeyForCheckoutMode", () => {
  it("maps each server checkout mode to the right CTA key", () => {
    expect(ctaKeyForCheckoutMode("free")).toBe("signup.plans.cta.free");
    expect(ctaKeyForCheckoutMode("trial")).toBe("signup.plans.cta.trial");
    expect(ctaKeyForCheckoutMode("checkout")).toBe("signup.plans.cta.subscribe");
    expect(ctaKeyForCheckoutMode("contact-sales")).toBe("signup.plans.cta.contactSales");
  });
});

describe("derivePriorityKeys / deriveBusinessType", () => {
  const answers = {
    business_type: ["Healthcare"],
    priorities_healthcare: ["Security", "HIPAA"],
  };

  it("derives the vertical from business_type (Q1)", () => {
    expect(deriveBusinessType(answers)).toBe("Healthcare");
    expect(deriveBusinessType({})).toBeNull();
  });

  it("collects Q3 priorities lowercased, excluding business_type", () => {
    expect(derivePriorityKeys(answers)).toEqual(["security", "hipaa"]);
  });

  it("returns an empty list when only Q1 is answered", () => {
    expect(derivePriorityKeys({ business_type: ["General"] })).toEqual([]);
  });
});

describe("formatCurrency", () => {
  it("formats with Intl and never hardcodes a symbol", () => {
    const usd = formatCurrency(49, "USD", "en-US");
    expect(usd).toContain("49");
    // It is a currency-formatted string, not a bare number.
    expect(usd).not.toBe("49");
  });

  it("prepends an approximate marker for FX-converted prices", () => {
    expect(formatCurrency(49, "USD", "en-US", true).startsWith("≈")).toBe(true);
  });

  it("falls back gracefully on an invalid currency code", () => {
    const out = formatCurrency(49, "ZZZ", "en-US");
    expect(out).toContain("ZZZ");
    expect(out).toContain("49");
  });
});
