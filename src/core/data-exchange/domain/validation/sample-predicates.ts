const ARABIC_INDIC_MAP: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "٫": ".",
  "،": ",",
};

const MASKED_SENTINEL_TOKENS = new Set([
  "REDACTED",
  "[REDACTED]",
  "MASKED",
  "[MASKED]",
]);

/**
 * Detects redacted UI/export sentinel tokens ("••••••", "***", "[REDACTED]", "[MASKED]")
 * so roundtrip re-imports of exported workbooks never trigger false-positive type errors.
 */
export function isMaskedSentinelSample(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (MASKED_SENTINEL_TOKENS.has(trimmed.toUpperCase())) return true;
  if (trimmed.length < 3) return false;
  for (const ch of trimmed) {
    if (ch !== "•" && ch !== "*" && ch !== "●" && ch !== "X") {
      return false;
    }
  }
  return true;
}

/** Normalizes Arabic-Indic numerals in a cell string for preview validation. */
export function normalizeDigitsForPreview(input: string): string {
  let out = "";
  for (const ch of input) {
    out += ARABIC_INDIC_MAP[ch] ?? ch;
  }
  return out;
}

/** Tests whether a cell sample string represents a valid numeric value without ASCII coercion. */
export function isNumericSample(raw: string, allowDecimal: boolean): boolean {
  if (isMaskedSentinelSample(raw)) return true;
  const normalized = normalizeDigitsForPreview(raw).trim();
  if (!normalized) return true;

  // Strip common thousands separators & currency codes/symbols surrounding numbers
  const cleaned = normalized
    .replace(/[\s,_]/g, "")
    .replace(/^(USD|EUR|GBP|EGP|SAR|AED|\$|€|£|ج\.م|ر\.س)/i, "")
    .replace(/(USD|EUR|GBP|EGP|SAR|AED|\$|€|£|ج\.م|ر\.س)$/i, "");

  if (!cleaned) return false;
  if (allowDecimal) {
    return /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(cleaned);
  }
  return /^[+-]?\d+$/.test(cleaned);
}

const VALID_BOOL_TOKENS = new Set([
  "true",
  "false",
  "1",
  "0",
  "yes",
  "no",
  "y",
  "n",
  "نعم",
  "لا",
  "صح",
  "خطأ",
]);

/** Tests whether a cell sample string represents a recognized boolean token. */
export function isBoolSample(raw: string): boolean {
  if (isMaskedSentinelSample(raw)) return true;
  const token = raw.trim().toLowerCase();
  return !token || VALID_BOOL_TOKENS.has(token);
}

/** Tests whether a cell sample string looks like an ISO/common date or Excel serial number. */
export function isDateSample(raw: string): boolean {
  if (isMaskedSentinelSample(raw)) return true;
  const trimmed = normalizeDigitsForPreview(raw).trim();
  if (!trimmed) return true;
  if (/^\d{4,5}(\.\d+)?$/.test(trimmed)) {
    const serial = Number(trimmed);
    return serial > 1 && serial < 95000;
  }
  return !Number.isNaN(Date.parse(trimmed));
}

/** Formats raw file size in bytes into human-readable units. */
export function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
