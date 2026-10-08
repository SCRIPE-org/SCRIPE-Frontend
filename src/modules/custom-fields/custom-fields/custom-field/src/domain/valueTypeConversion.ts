/**
 * Value Type Conversion Rules (Wave 6 row 6.2)
 *
 * Mirrors the pure C# domain classification in ValueTypeConversion.cs.
 * Every pair not explicitly permitted is classified as "Impossible".
 */
import type { ConversionKind } from "./entities/FieldInsight";

export function classifyValueTypeConversion(fromType: string, toType: string): ConversionKind {
  const normFrom = (fromType || "").trim().toLowerCase();
  const normTo = (toType || "").trim().toLowerCase();

  if (!normFrom || !normTo || normFrom === normTo) {
    return "NoChange";
  }

  // ── Into free text (Lossless)
  if (normFrom === "text" && normTo === "longtext") return "Lossless";
  if (normFrom === "number" && normTo === "text") return "Lossless";
  if (normFrom === "number" && normTo === "longtext") return "Lossless";
  if (normFrom === "percent" && normTo === "text") return "Lossless";
  if (normFrom === "rating" && normTo === "text") return "Lossless";

  // ── Free text conversions (Lossy)
  if (normFrom === "longtext" && normTo === "text") return "Lossy";
  if (normFrom === "text" && normTo === "number") return "Lossy";

  // ── Numeric family (Lossless)
  if (normFrom === "percent" && normTo === "number") return "Lossless";
  if (normFrom === "rating" && normTo === "number") return "Lossless";

  return "Impossible";
}

/**
 * Documentation for module export
 */
export function isConversionLossy(fromType: string, toType: string): boolean {
  return classifyValueTypeConversion(fromType, toType) === "Lossy";
}

/**
 * Documentation for module export
 */
export function isConversionAllowed(fromType: string, toType: string): boolean {
  const kind = classifyValueTypeConversion(fromType, toType);
  return kind === "Lossless" || kind === "Lossy";
}

/**
 * Documentation for [
 */
export const LOSSLESS_CONVERSIONS: ReadonlyArray<[string, string]> = [
  ["Text", "LongText"],
  ["Number", "Text"],
  ["Number", "LongText"],
  ["Percent", "Text"],
  ["Rating", "Text"],
  ["Percent", "Number"],
  ["Rating", "Number"],
];

/**
 * Documentation for [
 */
export const LOSSY_CONVERSIONS: ReadonlyArray<[string, string]> = [
  ["LongText", "Text"],
  ["Text", "Number"],
];

