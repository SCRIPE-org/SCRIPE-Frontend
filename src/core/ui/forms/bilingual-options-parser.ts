export interface BilingualOptionRow {
  en: string;
  ar: string;
}

/**
 * Splits the two stored strings into aligned rows.
 *
 * Trims and drops empty entries exactly as the SERVER's parser does
 * (`CustomFieldOptionsParser.ParseOptions`) — if this split disagreed with that one, a client could
 * be rejected for submitting precisely what it was shown.
 */
export function parseBilingualOptions(value: string, valueAr: string): BilingualOptionRow[] {
  const en = (value ?? "").split("\n").map((s) => s.trim()).filter((s) => s.length > 0);
  const rawAr = (valueAr ?? "").split("\n").map((s) => s.trim());
  const filteredAr = rawAr.filter((s) => s.length > 0);

  if (en.length === 0) {
    if (filteredAr.length > 0) {
      return filteredAr.map((ar) => ({ en: "", ar }));
    }
    return [];
  }

  // If rawAr has the same length as en, preserve empty lines (handles untranslated middle options like "صغير\n\nكبير")
  if (rawAr.length === en.length) {
    return en.map((label, index) => ({ en: label, ar: rawAr[index] ?? "" }));
  }

  // If filtered non-empty Arabic matches en's length (e.g. extra blank lines in valueAr)
  if (filteredAr.length === en.length) {
    return en.map((label, index) => ({ en: label, ar: filteredAr[index] ?? "" }));
  }

  const arSource = rawAr.length >= en.length ? rawAr : filteredAr;
  return en.map((label, index) => ({ en: label, ar: arSource[index] ?? "" }));
}

/**
 * Serialises rows back to the two aligned strings.
 *
 * A row with no English label is dropped — it cannot be selected, and keeping it would shift every
 * later Arabic label onto the wrong option. Arabic is emitted for the surviving rows only, so the two
 * lists stay the same length and aligned by construction rather than by convention.
 */
export function serializeBilingualOptions(rows: BilingualOptionRow[]): { en: string; ar: string } {
  const kept = rows.filter((row) => row.en.trim().length > 0);
  return {
    en: kept.map((row) => row.en.trim()).join("\n"),
    // Emitted only when at least one translation exists, so a wholly untranslated field stores null
    // rather than a string of empty lines.
    ar: kept.some((row) => row.ar.trim().length > 0)
      ? kept.map((row) => row.ar.trim()).join("\n")
      : "",
  };
}
