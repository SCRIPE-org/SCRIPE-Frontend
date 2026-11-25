/**
 * CSV Formula-Injection Neutralization & RFC-4180 Serialization Helpers
 *
 * Implements OWASP CWE-1236 defense by prefixing potentially active leading characters
 * (`=`, `+`, `-`, `@`, `\t`, `\r`, `\n`), including when preceded by ASCII whitespace,
 * soft hyphens, zero-width spaces, or Unicode bidi formatting characters.
 */

const CSV_FORMULA_PREFIX_RE =
  /^[\s\u00AD\u200B-\u200F\u2060\uFEFF\u202A-\u202E\u2066-\u2069]*[=+\-@\t\r\n]/;

/**
 * Neutralize spreadsheet formula payloads by prepending an apostrophe when a
 * cell begins with a dangerous formula trigger character.
 */
export function neutralizeCsvFormulaValue(value: unknown): string {
  const raw = value === null || value === undefined ? "" : String(value);
  return CSV_FORMULA_PREFIX_RE.test(raw) ? `'${raw}` : raw;
}

/**
 * Neutralize spreadsheet formula injection and serialize as an RFC-4180
 * double-quoted CSV cell with doubled internal quotes.
 */
export function sanitizeCsvCell(value: unknown): string {
  const safe = neutralizeCsvFormulaValue(value);
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Neutralize formula prefixes and only wrap in RFC-4180 quotes when the value
 * contains delimiters, quotes, line breaks, or formula neutralization prefixes.
 */
export function sanitizeCsvMinimalCell(value: unknown): string {
  if (value === undefined || value === null) return "";
  const safe = neutralizeCsvFormulaValue(value);
  if (
    safe !== String(value) ||
    safe.includes(",") ||
    safe.includes('"') ||
    safe.includes("\n") ||
    safe.includes("\r")
  ) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}
