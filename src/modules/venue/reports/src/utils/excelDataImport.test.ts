import { describe, it, expect } from "vitest";
import {
  parseDelimitedText,
  autoMapColumns,
  validateImportRows,
  IMPORT_SCHEMAS,
} from "./excelDataImport";
import {
  generateExcelWorkbookXml,
  generateCsv,
} from "./excelReportExport";

describe("excelDataImport", () => {
  it("parses CSV with quoted commas and headers correctly", () => {
    const csv = `Name,Type,Email,Phone\n"Al-Mansoor, Zaid",Person,zaid@test.com,+966500000001\n"Padel Club Pro",Organization,club@test.com,+966500000002`;
    const result = parseDelimitedText(csv);

    expect(result.headers).toEqual(["Name", "Type", "Email", "Phone"]);
    expect(result.rowCount).toBe(2);
    expect(result.rawRows[0][0]).toBe("Al-Mansoor, Zaid");
    expect(result.rawRows[0][1]).toBe("Person");
    expect(result.rawRows[1][0]).toBe("Padel Club Pro");
  });

  it("auto-maps headers fuzzy to target fields", () => {
    const headers = ["Customer Name", "Contact Email", "Mobile Number"];
    const mapping = autoMapColumns(headers, "customers");

    expect(mapping.name).toBe("Customer Name");
    expect(mapping.email).toBe("Contact Email");
  });

  it("validates rows, flags duplicates, missing required fields, and format warnings", () => {
    const csv = `Name,Type,Email\nValid User,Person,valid@user.com\n,Person,no-name@test.com\nExisting User,Person,existing@test.com\nDuplicate In File,Person,dup@test.com\nDuplicate In File,Person,dup2@test.com`;
    const parsed = parseDelimitedText(csv);
    const mapping = { name: "Name", type: "Type", email: "Email" };
    const existing = [{ id: "cust-1", name: "Existing User" }];

    const report = validateImportRows("customers", parsed, mapping, existing);

    expect(report.totalRows).toBe(5);
    expect(report.invalidCount).toBe(1); // row without name
    expect(report.duplicateCount).toBe(2); // Existing User and second Duplicate In File
    expect(report.validCount).toBe(2); // Valid User and first Duplicate In File
    expect(report.canCommit).toBe(true);
  });
});

describe("excelReportExport", () => {
  it("generates SpreadsheetML XML with isolated currency totals and metadata", () => {
    const xml = generateExcelWorkbookXml({
      title: "Financial Report",
      categoryName: "Financial",
      tenantName: "SCRIPE Venue Test Club",
      filters: { Currency: "SAR" },
      columns: [
        { header: "Invoice", key: "invoiceNumber" },
        { header: "Amount", key: "amount", format: "currency" },
      ],
      data: [{ invoiceNumber: "INV-001", amount: 150 }],
      currencyTotals: {
        SAR: { commercialValue: 150, collected: 150, outstanding: 0 },
      },
    });

    expect(xml).toContain("urn:schemas-microsoft-com:office:spreadsheet");
    expect(xml).toContain("Financial Report");
    expect(xml).toContain("SCRIPE Venue Test Club");
    expect(xml).toContain("Currency Summary (Isolated)");
    expect(xml).toContain("INV-001");
  });

  it("generates CSV with UTF-8 BOM and currency summary", () => {
    const csv = generateCsv({
      title: "Financial Report",
      categoryName: "Financial",
      tenantName: "SCRIPE Venue Test Club",
      filters: {},
      columns: [
        { header: "Invoice", key: "invoiceNumber" },
        { header: "Amount", key: "amount" },
      ],
      data: [{ invoiceNumber: "INV-001", amount: 150 }],
      currencyTotals: {
        SAR: { commercialValue: 150, collected: 150, outstanding: 0 },
      },
    });

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("INV-001");
    expect(csv).toContain("SAR,150.00,150.00,0.00");
  });
});
