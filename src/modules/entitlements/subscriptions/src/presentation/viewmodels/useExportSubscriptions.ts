/**
 * useExportSubscriptions Hook
 *
 * Client-side export for subscriptions data.
 * Supports CSV, Excel (XLSX via proper XML Spreadsheet 2003), and PDF generation.
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
      if (!dateStr) return "—";
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

const HEADERS = [
      "#",
      "Tenant",
      "Edition",
      "Status",
      "Type",
      "Currency",
      "Amount",
      "MRR (USD)",
      "Promo Code",
      "Discount",
      "Start Date",
      "End Date",
      "Downgraded",
];

function buildRows(subs: GlobalSubscriptionItem[]): string[][] {
      return subs.map((sub, idx) => [
            String(idx + 1),
            sub.tenantName || sub.tenantId,
            sub.editionName,
            sub.status,
            sub.type,
            sub.currency,
            sub.totalAmount.toFixed(2),
            `$${calcMrr(sub).toFixed(2)}`,
            sub.appliedPromoCode || "—",
            sub.promotionDiscount ? `${sub.promotionDiscount}%` : "—",
            formatDate(sub.startDate),
            formatDate(sub.endDate),
            sub.isDowngraded ? "Yes" : "No",
      ]);
}

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

// ── Excel (XML Spreadsheet 2003) Generator ──
// Uses proper XML Spreadsheet format compatible with Excel, LibreOffice, and Google Sheets.

function generateExcel(subs: GlobalSubscriptionItem[]): Blob {
      const rows = buildRows(subs);

      // Summary stats
      const totalMrr = subs.reduce((sum, s) => sum + calcMrr(s), 0);
      const active = subs.filter((s) => s.status === "Active").length;
      const trialing = subs.filter((s) => s.status === "Trialing").length;

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>Subscriptions Export</Title>
  <Author>NEXORA Platform</Author>
  <Created>${new Date().toISOString()}</Created>
</DocumentProperties>
<Styles>
  <Style ss:ID="Default" ss:Name="Normal">
    <Font ss:FontName="Segoe UI" ss:Size="10"/>
  </Style>
  <Style ss:ID="title">
    <Font ss:FontName="Segoe UI" ss:Size="14" ss:Bold="1" ss:Color="#0f172a"/>
  </Style>
  <Style ss:ID="subtitle">
    <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#64748b"/>
  </Style>
  <Style ss:ID="header">
    <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#ffffff"/>
    <Interior ss:Color="#1e293b" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
    </Borders>
  </Style>
  <Style ss:ID="data">
    <Font ss:FontName="Segoe UI" ss:Size="10"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    </Borders>
  </Style>
  <Style ss:ID="number">
    <Font ss:FontName="Segoe UI" ss:Size="10"/>
    <NumberFormat ss:Format="#,##0.00"/>
    <Alignment ss:Horizontal="Right"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    </Borders>
  </Style>
  <Style ss:ID="kpiLabel">
    <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#64748b"/>
  </Style>
  <Style ss:ID="kpiValue">
    <Font ss:FontName="Segoe UI" ss:Size="12" ss:Bold="1" ss:Color="#0f172a"/>
  </Style>
  <Style ss:ID="stripe">
    <Font ss:FontName="Segoe UI" ss:Size="10"/>
    <Interior ss:Color="#f8fafc" ss:Pattern="Solid"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    </Borders>
  </Style>
  <Style ss:ID="stripeNum">
    <Font ss:FontName="Segoe UI" ss:Size="10"/>
    <Interior ss:Color="#f8fafc" ss:Pattern="Solid"/>
    <NumberFormat ss:Format="#,##0.00"/>
    <Alignment ss:Horizontal="Right"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
    </Borders>
  </Style>
</Styles>
<Worksheet ss:Name="Subscriptions">
<Table ss:DefaultColumnWidth="100">
${HEADERS.map((_, i) => {
            const widths = [35, 120, 100, 80, 70, 60, 85, 85, 90, 65, 90, 90, 75];
            return `<Column ss:Width="${widths[i] || 100}"/>`;
      }).join("\n")}
<Row ss:Height="24">
  <Cell ss:StyleID="title" ss:MergeAcross="${HEADERS.length - 1}"><Data ss:Type="String">📋 NEXORA — Subscriptions Export</Data></Cell>
</Row>
<Row ss:Height="18">
  <Cell ss:StyleID="subtitle" ss:MergeAcross="${HEADERS.length - 1}"><Data ss:Type="String">Generated: ${new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })} | Total: ${subs.length} | Active: ${active} | Trialing: ${trialing} | MRR: $${totalMrr.toFixed(2)}</Data></Cell>
</Row>
<Row/>
<Row>
${HEADERS.map((h) => `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join("")}
</Row>
${rows.map((row, rowIdx) => {
            const isStripe = rowIdx % 2 === 1;
            const ds = isStripe ? "stripe" : "data";
            const ns = isStripe ? "stripeNum" : "number";
            return `<Row>${row.map((cell, colIdx) => {
                  // Numeric columns: Amount (6), MRR (7)
                  if (colIdx === 6 || colIdx === 7) {
                        const numVal = parseFloat(cell.replace(/[^0-9.-]/g, "")) || 0;
                        return `<Cell ss:StyleID="${ns}"><Data ss:Type="Number">${numVal}</Data></Cell>`;
                  }
                  return `<Cell ss:StyleID="${ds}"><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`;
            }).join("")}</Row>`;
      }).join("\n")}
</Table>
</Worksheet>
</Workbook>`;

      return new Blob([xml], {
            type: "application/vnd.ms-excel;charset=utf-8",
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
// Creates a professional HTML document and uses the browser's print-to-PDF capability.

function generatePDF(subs: GlobalSubscriptionItem[]): void {
      const rows = buildRows(subs);
      const now = new Date().toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
      });

      const totalMrr = subs.reduce((sum, s) => sum + calcMrr(s), 0);
      const active = subs.filter((s) => s.status === "Active").length;
      const trialing = subs.filter((s) => s.status === "Trialing").length;
      const totalRevenue = subs.reduce((sum, s) => sum + (s.totalAmountUsd || 0), 0);

      const html = `<!DOCTYPE html>
<html>
<head>
<title>Subscriptions Export — NEXORA</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; background: #fff; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 3px solid #3b82f6; }
  .header-left h1 { font-size: 22px; font-weight: 700; color: #0f172a; }
  .header-left p { font-size: 11px; color: #64748b; margin-top: 4px; }
  .header-right { text-align: right; }
  .header-right .brand { font-size: 14px; font-weight: 700; color: #3b82f6; letter-spacing: 1px; }
  .header-right .date { font-size: 10px; color: #94a3b8; margin-top: 2px; }

  /* KPI Row */
  .kpi-row { display: flex; gap: 12px; margin-bottom: 24px; }
  .kpi { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; flex: 1; }
  .kpi .label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }
  .kpi .value { font-size: 22px; font-weight: 800; margin-top: 4px; color: #0f172a; }
  .kpi .value.blue { color: #3b82f6; }
  .kpi .value.green { color: #059669; }
  .kpi .value.amber { color: #d97706; }

  /* Table */
  table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 8px; }
  th { background: #1e293b; color: #fff; padding: 10px 8px; text-align: left; font-weight: 600; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
  th:first-child { border-radius: 6px 0 0 0; }
  th:last-child { border-radius: 0 6px 0 0; }
  td { padding: 8px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
  tr:nth-child(even) { background: #f8fafc; }
  tr:hover { background: #f1f5f9; }

  /* Badges */
  .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 9px; font-weight: 700; letter-spacing: 0.3px; }
  .badge-active { background: #d1fae5; color: #065f46; }
  .badge-trialing { background: #dbeafe; color: #1e40af; }
  .badge-suspended { background: #fef3c7; color: #92400e; }
  .badge-canceled { background: #fee2e2; color: #991b1b; }
  .badge-graceperiod { background: #fed7aa; color: #9a3412; }

  /* Amount column */
  .amount { font-family: 'SF Mono', 'Fira Code', monospace; font-weight: 600; }

  /* Footer */
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
  .footer p { font-size: 9px; color: #94a3b8; }

  @media print {
    body { padding: 20px; }
    .kpi { break-inside: avoid; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="header">
  <div class="header-left">
    <h1>📋 Subscriptions Report</h1>
    <p>All active subscriptions across tenants</p>
  </div>
  <div class="header-right">
    <div class="brand">NEXORA</div>
    <div class="date">${now}</div>
  </div>
</div>

<div class="kpi-row">
  <div class="kpi"><div class="label">Total Subscriptions</div><div class="value blue">${subs.length}</div></div>
  <div class="kpi"><div class="label">Active</div><div class="value green">${active}</div></div>
  <div class="kpi"><div class="label">Trialing</div><div class="value amber">${trialing}</div></div>
  <div class="kpi"><div class="label">Total MRR</div><div class="value">$${totalMrr.toFixed(2)}</div></div>
  <div class="kpi"><div class="label">Total Revenue</div><div class="value green">$${totalRevenue.toFixed(2)}</div></div>
</div>

<table>
  <thead><tr>${HEADERS.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>
    ${rows
                  .map(
                        (row) =>
                              `<tr>${row
                                    .map((cell, i) => {
                                          // Status badge
                                          if (i === 3) {
                                                const cls =
                                                      cell === "Active" ? "badge-active"
                                                            : cell === "Trialing" ? "badge-trialing"
                                                                  : cell === "Suspended" ? "badge-suspended"
                                                                        : cell === "GracePeriod" ? "badge-graceperiod"
                                                                              : "badge-canceled";
                                                return `<td><span class="badge ${cls}">${cell}</span></td>`;
                                          }
                                          // Amount columns
                                          if (i === 6 || i === 7) {
                                                return `<td class="amount">${cell}</td>`;
                                          }
                                          return `<td>${cell}</td>`;
                                    })
                                    .join("")}</tr>`
                  )
                  .join("\n")}
  </tbody>
</table>

<div class="footer">
  <p>NEXORA Entitlements Platform — Confidential</p>
  <p>Page 1 of 1 • ${subs.length} records</p>
</div>
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
                              const filename = `nexora-subscriptions-${timestamp}.${ext}`;

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
