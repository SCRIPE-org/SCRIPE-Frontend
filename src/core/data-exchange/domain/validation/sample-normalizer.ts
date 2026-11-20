import type { DataExchangeTransformRule } from "../types";
import { normalizeDigitsForPreview } from "./sample-predicates";

const NULL_PLACEHOLDER_SET = new Set([
  "n/a",
  "#n/a",
  "na",
  "null",
  "nil",
  "none",
  "-",
  "—",
  "–",
  "--",
  "غير متاح",
  "لا يوجد",
]);

const PREFIX_SUFFIX_CURRENCY_PATTERNS = [
  /^(SAR|EGP|AED|USD|EUR|GBP|ر\.س\.|ر\.س|ج\.م\.|ج\.م|د\.إ\.|د\.إ|\$|€|£|﷼)\s*/i,
  /\s*(SAR|EGP|AED|USD|EUR|GBP|ر\.س\.|ر\.س|ج\.م\.|ج\.م|د\.إ\.|د\.إ|\$|€|£|﷼)$/i,
];

function normalizeNumericPreviewValue(
  rawVal: string,
  rule?: DataExchangeTransformRule | null,
  dataType?: string
): string {
  const isNumericType = dataType === "Int" || dataType === "Decimal" || dataType === "Currency";
  if (!isNumericType && !rule?.stripCurrencyAndGrouping && !rule?.convertAccountingNegatives) {
    return rawVal;
  }

  let val = normalizeDigitsForPreview(rawVal);
  let isNegative = false;
  let numSpan = val.trim();

  if (numSpan.endsWith("%") || numSpan.endsWith("٪")) {
    numSpan = numSpan.slice(0, -1).trim();
  }

  if (
    rule?.convertAccountingNegatives !== false &&
    numSpan.startsWith("(") &&
    numSpan.endsWith(")")
  ) {
    isNegative = true;
    numSpan = numSpan.slice(1, -1).trim();
  } else if (numSpan.startsWith("-")) {
    isNegative = true;
    numSpan = numSpan.slice(1).trim();
  } else if (numSpan.startsWith("+")) {
    numSpan = numSpan.slice(1).trim();
  }

  if (rule?.stripCurrencyAndGrouping !== false || isNumericType) {
    for (const pat of PREFIX_SUFFIX_CURRENCY_PATTERNS) {
      numSpan = numSpan.replace(pat, "").trim();
    }

    const dotIdx = numSpan.lastIndexOf(".");
    const commaIdx = numSpan.lastIndexOf(",");
    if (dotIdx > -1 && commaIdx > -1) {
      if (dotIdx > commaIdx) {
        numSpan = numSpan.replace(/,/g, "");
      } else {
        numSpan = numSpan.replace(/\./g, "").replace(",", ".");
      }
    } else if (commaIdx > -1 && dotIdx === -1) {
      const afterComma = numSpan.slice(commaIdx + 1);
      if (afterComma.length === 3 && /^\d{1,3},\d{3}$/.test(numSpan)) {
        numSpan = numSpan.replace(",", "");
      } else {
        numSpan = numSpan.replace(",", ".");
      }
    }
  }

  if (numSpan && !Number.isNaN(Number(numSpan))) {
    val = isNegative ? `-${numSpan}` : numSpan;
  }
  return val;
}

function normalizePhonePreviewValue(
  val: string,
  rule?: DataExchangeTransformRule | null,
  dataType?: string
): string {
  if (!rule?.defaultCountryDialCode && dataType !== "Phone") return val;

  const rawDigits = normalizeDigitsForPreview(val).replace(/[^\d+]/g, "");
  if (!rawDigits) return val;

  const defaultDial = rule?.defaultCountryDialCode || "";
  const dialCode = defaultDial.startsWith("+")
    ? defaultDial
    : defaultDial
      ? `+${defaultDial}`
      : "";

  if (rawDigits.startsWith("00")) {
    return `+${rawDigits.slice(2)}`;
  }
  if (rawDigits.startsWith("+")) {
    return rawDigits;
  }
  if (dialCode) {
    return rawDigits.startsWith("0") ? `${dialCode}${rawDigits.slice(1)}` : `${dialCode}${rawDigits}`;
  }
  return val;
}

function normalizeEmailPreviewValue(
  val: string,
  rule?: DataExchangeTransformRule | null,
  dataType?: string
): string {
  if (!rule?.normalizeEmailAddress && dataType !== "Email") return val;

  let email = val.trim();
  if (email.toLowerCase().startsWith("mailto:")) {
    email = email.slice(7).split("?")[0].trim();
  }
  const match = /<([^>]+)>/.exec(email);
  if (match) {
    email = match[1].trim();
  }
  const atIdx = email.lastIndexOf("@");
  if (atIdx > 0 && atIdx < email.length - 1) {
    return `${email.slice(0, atIdx)}@${email.slice(atIdx + 1).toLowerCase()}`;
  }
  return val;
}

/**
 * Normalizes a raw cell sample string using the given transform rule and target data type,
 * producing a deterministic preview matching backend SpreadsheetValueNormalizer in linear time O(n).
 */
export function previewNormalizedSample(
  rawSample: string,
  rule?: DataExchangeTransformRule | null,
  dataType?: string
): string {
  if (rawSample == null || rawSample === "") {
    return rule?.defaultValue ?? "";
  }

  let val = String(rawSample);

  if (rule?.normalizeUnicodeCompatibility !== false) {
    val = val
      .replace(/\u00A0/g, " ")
      .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
  }

  if (rule?.trim !== false) {
    val = val.trim();
  }

  if (val.startsWith("'") && /^'[+-]?\d/.test(val)) {
    val = val.slice(1);
  }

  if (rule?.stripArabicDiacritics !== false) {
    val = val.replace(/[\u064B-\u065F\u0670\u0640]/g, "");
  }
  if (rule?.normalizeArabicLetters) {
    val = val
      .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
      .replace(/[\u0649\u06CC]/g, "\u064A")
      .replace(/\u06A9/g, "\u0643");
  }

  if (rule?.canonicalizeNullTokens !== false) {
    const candidate = val.trim().toLowerCase();
    if (NULL_PLACEHOLDER_SET.has(candidate)) {
      return rule?.defaultValue ?? "";
    }
  }

  if (rule?.collapseWhitespace !== false) {
    val = val.replace(/\s+/g, " ");
    if (rule?.trim !== false) {
      val = val.trim();
    }
  }

  if (rule?.multiValueDelimiter && val.includes(rule.multiValueDelimiter)) {
    const parts = val.split(rule.multiValueDelimiter);
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const p of parts) {
      const cleanPart = p.trim();
      if (!cleanPart) continue;
      const lower = cleanPart.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        deduped.push(cleanPart);
      }
    }
    val = deduped.join(rule.multiValueDelimiter + " ");
  }

  val = normalizeNumericPreviewValue(val, rule, dataType);
  val = normalizePhonePreviewValue(val, rule, dataType);
  val = normalizeEmailPreviewValue(val, rule, dataType);

  if (!val && rule?.defaultValue) {
    val = rule.defaultValue;
  }

  if (rule?.caseMode === "Upper" || rule?.uppercase) {
    val = val.toUpperCase();
  } else if (rule?.caseMode === "Lower" || rule?.lowercase) {
    val = val.toLowerCase();
  } else if (rule?.caseMode === "Title") {
    val = val.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return val;
}
