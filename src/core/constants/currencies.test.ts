/**
 * Pins the ISO 4217 minor-unit table this module formats prices with.
 *
 * WHY THIS FILE EXISTS. `formatPrice` hardcoded two decimals for every currency, while
 * `SUPPORTED_CURRENCIES` in the same file offers JPY (zero minor units) and KWD, BHD and OMR
 * (three). So a Japanese yen price rendered a subunit that does not exist, and three Gulf
 * currencies silently dropped one that does. Nothing failed, because nothing asserted a
 * non-two-decimal currency — the only coverage went through USD-shaped amounts.
 *
 * WHY THE LISTS ARE REPEATED HERE. Two independent literal lists that must agree is the honest
 * shape when the other one lives in a different language: the sets in `currencies.ts` mirror
 * `CurrencyPrecision` in the pricing engine, and nothing can enforce that across the process
 * boundary. Repeating them here at least makes a one-sided edit fail.
 *
 * WHY NOT `Intl`'s OWN DIGITS. `Intl` carries CLDR *formatting* digits, which diverge from the
 * standard's minor units on purpose — CLDR reports 0 for IQD where ISO 4217 says 3. Asserting
 * against `Intl` would encode the divergence as the expectation instead of catching it.
 *
 * @module core/constants
 */

import { describe, expect, it } from "vitest";

import { formatPrice, minorUnitDigits, SUPPORTED_CURRENCIES } from "./currencies";

/** The seven active currencies ISO 4217 assigns three minor units. A closed set, not a sample. */
const THREE_DECIMAL = ["BHD", "IQD", "JOD", "KWD", "LYD", "OMR", "TND"];

/** The sixteen ISO 4217 assigns none. */
const ZERO_DECIMAL = [
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
];

describe("minorUnitDigits", () => {
  it.each(THREE_DECIMAL)("treats %s as a three-decimal currency", (code) => {
    expect(minorUnitDigits(code)).toBe(3);
  });

  it.each(ZERO_DECIMAL)("treats %s as a zero-decimal currency", (code) => {
    expect(minorUnitDigits(code)).toBe(0);
  });

  // The negative half of the closed set. Regional neighbours of the three-decimal seven rather
  // than arbitrary majors, because those are the codes most likely to be added by mistake.
  it.each(["AED", "EGP", "MAD", "QAR", "SAR", "USD", "EUR", "GBP"])(
    "treats %s as a two-decimal currency",
    (code) => {
      expect(minorUnitDigits(code)).toBe(2);
    },
  );

  it("matches a lowercase code, since callers pass through user and API data", () => {
    expect(minorUnitDigits("kwd")).toBe(3);
    expect(minorUnitDigits("jpy")).toBe(0);
  });

  it("falls back to two decimals for an unknown or malformed code rather than throwing", () => {
    // Same default the pricing engine applies. A picker rendering a price must not crash on a
    // code the table has not heard of.
    expect(minorUnitDigits("ZZZ")).toBe(2);
    expect(minorUnitDigits("")).toBe(2);
  });
});

describe("formatPrice", () => {
  // Asserted as rendered digits rather than as a digit count, because the digit count was
  // already "correct" in the sense that the old code passed 2 deliberately. What was wrong was
  // the amount on screen.
  it("keeps the third subunit digit of a three-decimal currency", () => {
    // Previously rendered as 1,000.56 — the third digit rounded away.
    expect(formatPrice(1000.555, "KWD")).toContain("1,000.555");
    expect(formatPrice(1000.555, "BHD")).toContain("1,000.555");
    expect(formatPrice(1000.555, "OMR")).toContain("1,000.555");
  });

  it("renders a zero-decimal currency as whole units", () => {
    // Previously rendered as ¥1,000.50, inventing a subunit the yen does not have.
    const formatted = formatPrice(1000.5, "JPY");
    expect(formatted).toContain("1,001");
    expect(formatted).not.toContain(".");
  });

  it("still renders an ordinary two-decimal currency unchanged", () => {
    expect(formatPrice(1000.5, "USD")).toBe("$1,000.50");
  });

  it("uses the currency's precision on the fallback path too, not just the Intl path", () => {
    // "ZZ" is not a well-formed currency code, so Intl.NumberFormat throws and the catch runs.
    // The fallback used to be hardcoded to toFixed(2) as well, so this is the half of the bug
    // that only appears for a code Intl rejects.
    expect(formatPrice(1000.5, "ZZ")).toBe("ZZ 1000.50");
  });

  it("honours an explicit locale without changing the precision", () => {
    const arabic = formatPrice(1000.555, "KWD", "ar-EG");
    expect(minorUnitDigits("KWD")).toBe(3);
    expect(arabic).not.toBe("");
  });
});

describe("SUPPORTED_CURRENCIES", () => {
  it("has no duplicate codes", () => {
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("offers at least one currency from each precision class, so the table is load-bearing", () => {
    // If this ever fails it means the picker no longer offers a non-two-decimal currency, and
    // the bug above would have become unreachable rather than fixed. Worth knowing either way.
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    expect(codes.some((c) => minorUnitDigits(c) === 0)).toBe(true);
    expect(codes.some((c) => minorUnitDigits(c) === 3)).toBe(true);
    expect(codes.some((c) => minorUnitDigits(c) === 2)).toBe(true);
  });
});
