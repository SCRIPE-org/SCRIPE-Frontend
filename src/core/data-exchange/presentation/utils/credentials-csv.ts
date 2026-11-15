const CSV_FORMULA_PREFIX_RE = /^[=+\-@\t\r]/;

export interface EphemeralCredentialCsvRow {
  rowNumber: number;
  email: string;
  username: string;
  oneTimePassword: string;
}

/**
 * Neutralizes spreadsheet formula prefixes (OWASP CWE-1236) and wraps the cell
 * in RFC 4180 double-quotes with doubled internal quotes.
 */
export function formatCredentialsCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? "" : String(value);
  const safe = CSV_FORMULA_PREFIX_RE.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Builds an RFC 4180 CSV payload for ephemeral onboarding credentials with
 * CSV formula-injection neutralization and proper quote escaping.
 */
export function buildCredentialsCsv(creds: ReadonlyArray<EphemeralCredentialCsvRow>): string {
  const lines = creds.map((c) => {
    const rowNum =
      typeof c.rowNumber === "number" && Number.isFinite(c.rowNumber) && c.rowNumber >= 0
        ? String(Math.trunc(c.rowNumber))
        : formatCredentialsCsvCell(c.rowNumber);
    return [
      rowNum,
      formatCredentialsCsvCell(c.email),
      formatCredentialsCsvCell(c.username),
      formatCredentialsCsvCell(c.oneTimePassword),
    ].join(",");
  });
  return ["rowNumber,email,username,oneTimePassword", ...lines].join("\n");
}
