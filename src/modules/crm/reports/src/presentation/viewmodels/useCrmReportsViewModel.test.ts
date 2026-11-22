import { describe, expect, it } from "vitest";
import { formatSafeCsvCell } from "./useCrmReportsViewModel";

describe("CSV Formula Sanitization (CRM Reports)", () => {
  it("neutralizes spreadsheet formula prefixes (=, +, -, @, tab, cr, lf) and applies RFC4180 quoting", () => {
    expect(formatSafeCsvCell('=CMD("calc")')).toBe('"\'=CMD(""calc"")"');
    expect(formatSafeCsvCell("+1+1")).toBe('"\'+1+1"');
    expect(formatSafeCsvCell("-2+3")).toBe('"\'-2+3"');
    expect(formatSafeCsvCell("@SUM(A1:A2)")).toBe('"\'@SUM(A1:A2)"');
    expect(formatSafeCsvCell("\t=1+1")).toBe('"\'\t=1+1"');
    expect(formatSafeCsvCell("\r=1+1")).toBe('"\'\r=1+1"');
    expect(formatSafeCsvCell(" =IMPORTXML()")).toBe('"\' =IMPORTXML()"');
    expect(formatSafeCsvCell('Stage "Alpha", Q1')).toBe('"Stage ""Alpha"", Q1"');
  });
});
