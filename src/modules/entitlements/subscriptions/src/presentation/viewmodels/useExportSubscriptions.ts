/**
 * useExportSubscriptions Hook
 *
 * Client-side export for subscriptions data.
 * Supports CSV, Excel (XLSX via blob), and PDF generation.
 *
 * Data is already in memory so we generate files client-side
 * instead of hitting a backend endpoint.
 *
 * SOLID: Single responsibility — export logic only.
 */
"use client";

import { useState, useCallback } from "react";
import type { GlobalSubscriptionItem } from "../../domain/entities/Subscription";

export type ExportFormat = "csv" | "excel" | "pdf";

interface ExportParams {
      format: ExportFormat;
      subscriptions: GlobalSubscriptionItem[];
      displayCurrency?: string;
}

interface UseExportSubscriptionsResult {
      exportSubscriptions: (params: ExportParams) => Promise<void>;
      isExporting: boolean;
      error: string | null;
}

// ── Helpers ──

function formatDate(dateStr?: string | null): string {
      if (!dateStr) return "∞";
      return new Date(dateStr).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "numeric",
      });
}

function calcMrr(sub: GlobalSubscriptionItem): number {
      if (sub.type === "Lifetime") return 0;
      if (sub.type === "Yearly") return sub.totalAmountUsd / 12;
      return sub.totalAmountUsd;
}

function buildRows(subs: GlobalSubscriptionItem[]): string[][] {
      return subs.map((sub, idx) => [
            String(idx + 1),
            sub.editionName,
            sub.status,
            sub.type,
            `${sub.currency} ${sub.totalAmount.toFixed(2)}`,
            `$${calcMrr(sub).toFixed(2)}/mo`,
            formatDate(sub.startDate),
            formatDate(sub.endDate),
            sub.isDowngraded ? "Yes" : "No",
      ]);
}

const HEADERS = [
      "#",
      "Edition",
      "Status",
      "Type",
      "Amount",
      "MRR (USD)",
      "Start Date",
      "End Date",
      "Downgraded",
];

// ── CSV Generator ──

function generateCSV(subs: GlobalSubscriptionItem[]): Blob {
      const rows = buildRows(subs);
      const csvContent = [
            HEADERS.join(","),
            ...rows.map((row) =>
                  row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
            ),
      ].join("\n");

      return new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
}

// ── Excel (XLSX) Generator ──
// Uses a simple XML spreadsheet format that Excel can open natively.

function generateExcel(subs: GlobalSubscriptionItem[]): Blob {
      const rows = buildRows(subs);

      const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
 <Style ss:ID="header">
  <Font ss:Bold="1" ss:Size="11"/>
  <Interior ss:Color="#1e293b" ss:Pattern="Solid"/>
  <Font ss:Color="#ffffff" ss:Bold="1"/>
 </Style>
 <Style ss:ID="data">
  <Font ss:Size="10"/>
 </Style>
</Styles>
<Worksheet ss:Name="Subscriptions">
<Table>`;

      const headerRow = `<Row>${HEADERS.map(
            (h) => `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`
      ).join("")}</Row>`;

      const dataRows = rows
            .map(
                  (row) =>
                        `<Row>${row
                              .map(
                                    (cell) =>
                                          `<Cell ss:StyleID="data"><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`
                              )
                              .join("")}</Row>`
            )
            .join("\n");

      const xmlFooter = `</Table>
</Worksheet>
</Workbook>`;

      const xml = `${xmlHeader}\n${headerRow}\n${dataRows}\n${xmlFooter}`;
      return new Blob([xml], {
            type: "application/vnd.ms-excel",
      });
}

function escapeXml(str: string): string {
      return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
}

// ── PDF Generator ──
// Creates a clean HTML table and uses the browser's print-to-PDF capability.

function generatePDF(subs: GlobalSubscriptionItem[]): void {
      const rows = buildRows(subs);
      const now = new Date().toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
      });

      const totalMrr = subs.reduce((sum, s) => sum + calcMrr(s), 0);
      const active = subs.filter((s) => s.status === "Active").length;

      const html = `<!DOCTYPE html>
<html>
<head>
<title>Subscriptions Export</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1e293b; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; border-bottom: 2px solid #3b82f6; padding-bottom: 16px; }
  .header h1 { font-size: 24px; color: #0f172a; }
  .header .date { font-size: 12px; color: #64748b; }
  .kpi-row { display: flex; gap: 16px; margin-bottom: 24px; }
  .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; flex: 1; }
  .kpi .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .kpi .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #1e293b; color: #fff; padding: 10px 8px; text-align: left; font-weight: 600; }
  td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; }
  .badge-active { background: #d1fae5; color: #065f46; }
  .badge-trialing { background: #dbeafe; color: #1e40af; }
  .badge-suspended { background: #fef3c7; color: #92400e; }
  .badge-canceled { background: #fee2e2; color: #991b1b; }
  .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <h1>📋 Subscriptions Export</h1>
  <div class="date">Generated: ${now}</div>
</div>
<div class="kpi-row">
  <div class="kpi"><div class="label">Total Subscriptions</div><div class="value">${subs.length}</div></div>
  <div class="kpi"><div class="label">Active</div><div class="value">${active}</div></div>
  <div class="kpi"><div class="label">Total MRR</div><div class="value">$${totalMrr.toFixed(2)}</div></div>
</div>
<table>
  <thead><tr>${HEADERS.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>
    ${rows
                  .map(
                        (row) =>
                              `<tr>${row
                                    .map((cell, i) => {
                                          if (i === 2) {
                                                const cls =
                                                      cell === "Active" ? "badge-active"
                                                            : cell === "Trialing" ? "badge-trialing"
                                                                  : cell === "Suspended" ? "badge-suspended"
                                                                        : "badge-canceled";
                                                return `<td><span class="badge ${cls}">${cell}</span></td>`;
                                          }
                                          return `<td>${cell}</td>`;
                                    })
                                    .join("")}</tr>`
                  )
                  .join("\n")}
  </tbody>
</table>
<div class="footer">NEXORA Entitlements Platform — Confidential</div>
</body>
</html>`;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 300);
      }
}

// ── Main Hook ──

export function useExportSubscriptions(): UseExportSubscriptionsResult {
      const [isExporting, setIsExporting] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const exportSubscriptions = useCallback(
            async ({ format, subscriptions }: ExportParams) => {
                  setIsExporting(true);
                  setError(null);

                  try {
                        if (subscriptions.length === 0) {
                              throw new Error("No subscriptions to export");
                        }

                        const timestamp = new Date().toISOString().slice(0, 10);

                        if (format === "pdf") {
                              generatePDF(subscriptions);
                        } else {
                              const blob =
                                    format === "csv"
                                          ? generateCSV(subscriptions)
                                          : generateExcel(subscriptions);

                              const ext = format === "excel" ? "xls" : format;
                              const filename = `subscriptions-export-${timestamp}.${ext}`;

                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = filename;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                        }
                  } catch (err) {
                        const message =
                              err instanceof Error ? err.message : "Export failed";
                        setError(message);
                        throw err;
                  } finally {
                        setIsExporting(false);
                  }
            },
            []
      );

      return { exportSubscriptions, isExporting, error };
}
