import { describe, it, expect } from "vitest";
import { generateExcelWorkbookXml, generateCsv } from "./excelReportExport";

describe("excelReportExport", () => {
  const sampleData = [
    {
      invoiceNumber: "INV-2026-001",
      payerPartyId: "Ahmed Ali",
      reservationId: "RES-98214",
      status: "Issued",
      issuedAtUtc: "2026-10-11T12:00:00Z",
      currencyCode: "EGP",
      totalAmount: 500,
      paidAmount: 500,
      outstandingAmount: 0,
    },
    {
      invoiceNumber: "INV-2026-002",
      payerPartyId: "Sara Mansour",
      reservationId: "RES-98215",
      status: "Issued",
      issuedAtUtc: "2026-10-11T14:00:00Z",
      currencyCode: "USD",
      totalAmount: 80,
      paidAmount: 0,
      outstandingAmount: 80,
    },
  ];

  it("generates standards-compliant XML SpreadsheetML with metadata headers", () => {
    const xml = generateExcelWorkbookXml({
      title: "SCRIPE Venue — Financial Report",
      categoryName: "Financial",
      tenantName: "SCRIPE Venue Test Club",
      generatedBy: "manager@scripe.com",
      filters: { "Date Range": "2026-10-01 to 2026-10-11", Currency: "All" },
      columns: [
        { header: "Invoice Number", key: "invoiceNumber" },
        { header: "Customer / Payer", key: "payerPartyId" },
        { header: "Booking Reference", key: "reservationId" },
        { header: "Status", key: "status" },
        { header: "Currency", key: "currencyCode" },
        { header: "Total Amount", key: "totalAmount", format: "currency" },
        { header: "Paid Amount", key: "paidAmount", format: "currency" },
        { header: "Outstanding Amount", key: "outstandingAmount", format: "currency" },
      ],
      data: sampleData,
      currencyTotals: {
        EGP: { commercialValue: 500, collected: 500, outstanding: 0 },
        USD: { commercialValue: 80, collected: 0, outstanding: 80 },
      },
    });

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('xmlns="urn:schemas-microsoft-com:office:spreadsheet"');
    expect(xml).toContain("SCRIPE Venue — Financial Report");
    expect(xml).toContain("SCRIPE Venue Test Club");
    expect(xml).toContain("manager@scripe.com");
    expect(xml).toContain("INV-2026-001");
    expect(xml).toContain("Ahmed Ali");
    expect(xml).toContain("INV-2026-002");
    expect(xml).toContain("Sara Mansour");
  });

  it("strictly isolates unlike currencies and never sums them together (Requirement A11)", () => {
    const xml = generateExcelWorkbookXml({
      title: "SCRIPE Venue — Financial Report",
      categoryName: "Financial",
      tenantName: "SCRIPE Venue Test Club",
      filters: {},
      columns: [
        { header: "Invoice Number", key: "invoiceNumber" },
        { header: "Currency", key: "currencyCode" },
        { header: "Total Amount", key: "totalAmount", format: "currency" },
      ],
      data: sampleData,
      currencyTotals: {
        EGP: { commercialValue: 500, collected: 500, outstanding: 0 },
        USD: { commercialValue: 80, collected: 0, outstanding: 80 },
      },
    });

    // Contains isolated currency rows
    expect(xml).toContain('<Data ss:Type="String">EGP</Data>');
    expect(xml).toContain('<Data ss:Type="Number">500</Data>');
    expect(xml).toContain('<Data ss:Type="String">USD</Data>');
    expect(xml).toContain('<Data ss:Type="Number">80</Data>');

    // Never merged unlike currencies together into 580
    expect(xml).not.toContain('<Data ss:Type="Number">580</Data>');
  });

  it("generates RFC 4180 CSV with proper headers and escaping", () => {
    const csv = generateCsv({
      title: "SCRIPE Venue — Financial Report",
      categoryName: "Financial",
      tenantName: "SCRIPE Venue Test Club",
      filters: {},
      columns: [
        { header: "Invoice Number", key: "invoiceNumber" },
        { header: "Customer / Payer", key: "payerPartyId" },
        { header: "Total Amount", key: "totalAmount" },
      ],
      data: sampleData,
    });

    expect(csv).toContain("Invoice Number,Customer / Payer,Total Amount");
    expect(csv).toContain("INV-2026-001,Ahmed Ali,500");
    expect(csv).toContain("INV-2026-002,Sara Mansour,80");
  });
});
