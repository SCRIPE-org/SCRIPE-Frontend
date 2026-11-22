import { describe, it, expect } from "vitest";
import { buildCredentialsCsv, formatCredentialsCsvCell } from "../credentials-csv";
import { buildJobFromExecution } from "../build-job";

describe("credentials-csv and build-job security utilities", () => {
  it("neutralizes formula prefixes preceded by whitespace, tabs, zero-width, and bidi characters", () => {
    expect(formatCredentialsCsvCell("=cmd|'/C calc'!A0")).toBe(`"'=cmd|'/C calc'!A0"`);
    expect(formatCredentialsCsvCell("   +SUM(A1:A2)")).toBe(`"'   +SUM(A1:A2)"`);
    expect(formatCredentialsCsvCell("\u200B-1+1")).toBe(`"'\u200B-1+1"`);
    expect(formatCredentialsCsvCell("\uFEFF@IMPORTXML()")).toBe(`"'\uFEFF@IMPORTXML()"`);
    expect(formatCredentialsCsvCell("\u202E=HYPERLINK(\"http://evil\")")).toBe(
      `"'\u202E=HYPERLINK(""http://evil"")"`
    );
    expect(formatCredentialsCsvCell("\tfoo")).toBe(`"'\tfoo"`);
    expect(formatCredentialsCsvCell("safe-pass!123")).toBe(`"safe-pass!123"`);
  });

  it("builds valid RFC 4180 CSV headers and escaped rows", () => {
    const csv = buildCredentialsCsv([
      {
        rowNumber: 2,
        email: "=evil@example.com",
        username: "jane.doe",
        oneTimePassword: 'Pass"123',
      },
    ]);
    expect(csv).toBe(
      `rowNumber,email,username,oneTimePassword\n2,"'=evil@example.com","jane.doe","Pass""123"`
    );
  });

  it("sets MultiSheetMigration kind when isMultiSheet is true and Import otherwise", () => {
    const baseResult = {
      jobId: "job-99",
      status: "Running" as const,
      executedSynchronously: false,
      totalRows: 20,
      processedRows: 0,
      committedRows: 0,
      createdRows: 0,
      updatedRows: 0,
      rejectedRows: 0,
      cascadeDeferredRows: 0,
      hasRejectedWorkbook: false,
    };

    const multi = buildJobFromExecution(
      baseResult,
      { entityKey: "party.person", format: "xlsx", fileName: "multi.xlsx" },
      "party.person",
      true,
      "Upsert",
      "StagedPendingInvite",
      null
    );
    expect(multi.kind).toBe("MultiSheetMigration");
    expect(multi.isMultiSheet).toBe(true);

    const single = buildJobFromExecution(
      baseResult,
      { entityKey: "crm.lead", format: "csv", fileName: "leads.csv" },
      "crm.lead",
      false,
      "Insert",
      "StagedPendingInvite",
      null
    );
    expect(single.kind).toBe("Import");
    expect(single.isMultiSheet).toBe(false);
  });
});
