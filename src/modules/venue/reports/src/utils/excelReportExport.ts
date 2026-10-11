/**
 * Excel Report Export Utility
 * 
 * Generates standards-compliant Excel XML Workbooks (SpreadsheetML) and CSV files
 * that open natively in Microsoft Excel, Apple Numbers, and Google Sheets.
 * Adheres strictly to Requirement A11:
 * - Emits authoritative backend data, never just the visible DOM table.
 * - Enforces currency isolation (never sums unlike currencies).
 * - Full metadata header: Generation timestamp, Tenant context, Filter parameters.
 */

export interface ExportColumn<T> {
  header: string;
  key: keyof T | string;
  format?: "text" | "number" | "currency" | "date";
  getValue?: (item: T) => string | number;
}

export interface ReportExportOptions<T> {
  title: string;
  categoryName: string;
  tenantName: string;
  generatedBy?: string;
  filters: Record<string, string>;
  columns: ExportColumn<T>[];
  data: T[];
  currencyTotals?: Record<string, { commercialValue: number; collected: number; outstanding: number }>;
}

/**
 * Escapes text for XML Spreadsheet format.
 */
function escapeXml(unsafe: string | number | undefined | null): string {
  if (unsafe === undefined || unsafe === null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Escapes text for RFC 4180 CSV format.
 */
function escapeCsv(cell: string | number | undefined | null): string {
  if (cell === undefined || cell === null) return "";
  const str = String(cell);
  if (str.includes(",") || str.includes("\"") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an Excel Workbook in SpreadsheetML 2003 XML format (.xls / .xlsx compatible).
 */
export function generateExcelWorkbookXml<T>(options: ReportExportOptions<T>): string {
  const { title, categoryName, tenantName, generatedBy, filters, columns, data, currencyTotals } = options;
  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderTitle">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="MetaLabel">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#64748B"/>
  </Style>
  <Style ss:ID="MetaValue">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="ColHeader">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
   </Borders>
  </Style>
  <Style ss:ID="DataCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="DataCellNumber">
   <Alignment ss:Horizontal="Right"/>
   <NumberFormat ss:Format="#,##0.00"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="TotalCell">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Right"/>
   <NumberFormat ss:Format="#,##0.00"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(categoryName.slice(0, 31))}">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="160"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="100"/>
   
   <!-- Title Row -->
   <Row ss:Height="36">
    <Cell ss:MergeAcross="${columns.length - 1}" ss:StyleID="HeaderTitle">
     <Data ss:Type="String">  ${escapeXml(title)}</Data>
    </Cell>
   </Row>
   <Row ss:Height="8"/>
   
   <!-- Metadata Rows -->
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Tenant:</Data></Cell>
    <Cell ss:StyleID="MetaValue"><Data ss:Type="String">${escapeXml(tenantName)}</Data></Cell>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Generated At:</Data></Cell>
    <Cell ss:StyleID="MetaValue"><Data ss:Type="String">${escapeXml(now)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Category:</Data></Cell>
    <Cell ss:StyleID="MetaValue"><Data ss:Type="String">${escapeXml(categoryName)}</Data></Cell>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Operator:</Data></Cell>
    <Cell ss:StyleID="MetaValue"><Data ss:Type="String">${escapeXml(generatedBy || "Venue Manager")}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Filters Applied:</Data></Cell>
    <Cell ss:MergeAcross="${columns.length - 2}" ss:StyleID="MetaValue">
     <Data ss:Type="String">${escapeXml(Object.entries(filters).map(([k, v]) => `${k}: ${v}`).join(" | "))}</Data>
    </Cell>
   </Row>
   <Row ss:Height="12"/>
`;

  // Currency Isolation Totals Section (Requirement A11: Never sum unlike currencies together)
  if (currencyTotals && Object.keys(currencyTotals).length > 0) {
    xml += `   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Currency Summary (Isolated):</Data></Cell>
   </Row>
   <Row ss:StyleID="ColHeader">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Currency</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Commercial Value</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Total Collected</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Outstanding</Data></Cell>
   </Row>
`;
    for (const [curr, totals] of Object.entries(currencyTotals)) {
      xml += `   <Row>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(curr)}</Data></Cell>
    <Cell ss:StyleID="DataCellNumber"><Data ss:Type="Number">${totals.commercialValue}</Data></Cell>
    <Cell ss:StyleID="DataCellNumber"><Data ss:Type="Number">${totals.collected}</Data></Cell>
    <Cell ss:StyleID="DataCellNumber"><Data ss:Type="Number">${totals.outstanding}</Data></Cell>
   </Row>
`;
    }
    xml += `   <Row ss:Height="12"/>\n`;
  }

  // Column Headers
  xml += `   <Row ss:Height="24">
`;
  for (const col of columns) {
    xml += `    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">${escapeXml(col.header)}</Data></Cell>\n`;
  }
  xml += `   </Row>\n`;

  // Data Rows
  for (const row of data) {
    xml += `   <Row>
`;
    for (const col of columns) {
      const val = col.getValue ? col.getValue(row) : (row as any)[col.key];
      const isNum = col.format === "number" || col.format === "currency" || typeof val === "number";
      const styleId = isNum ? "DataCellNumber" : "DataCell";
      const type = isNum && !isNaN(Number(val)) ? "Number" : "String";
      xml += `    <Cell ss:StyleID="${styleId}"><Data ss:Type="${type}">${escapeXml(val)}</Data></Cell>\n`;
    }
    xml += `   </Row>\n`;
  }

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  return xml;
}

/**
 * Generates an RFC 4180 compliant CSV string with UTF-8 BOM for universal Excel compatibility.
 */
export function generateCsv<T>(options: ReportExportOptions<T>): string {
  const { title, tenantName, filters, columns, data, currencyTotals } = options;
  const lines: string[] = [];

  // UTF-8 BOM
  lines.push(`\uFEFF# ${escapeCsv(title)}`);
  lines.push(`# Tenant: ${escapeCsv(tenantName)}`);
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push(`# Filters: ${escapeCsv(Object.entries(filters).map(([k, v]) => `${k}=${v}`).join("; "))}`);
  lines.push("");

  if (currencyTotals && Object.keys(currencyTotals).length > 0) {
    lines.push("# CURRENCY SUMMARY (ISOLATED - NEVER SUMMED ACROSS CURRENCIES)");
    lines.push("Currency,Commercial Value,Total Collected,Outstanding");
    for (const [curr, totals] of Object.entries(currencyTotals)) {
      lines.push(`${escapeCsv(curr)},${totals.commercialValue.toFixed(2)},${totals.collected.toFixed(2)},${totals.outstanding.toFixed(2)}`);
    }
    lines.push("");
  }

  // Header row
  lines.push(columns.map((c) => escapeCsv(c.header)).join(","));

  // Data rows
  for (const row of data) {
    const vals = columns.map((col) => {
      const val = col.getValue ? col.getValue(row) : (row as any)[col.key];
      return escapeCsv(val);
    });
    lines.push(vals.join(","));
  }

  return lines.join("\r\n");
}

/**
 * Triggers a browser download of the generated report spreadsheet.
 */
export function downloadReportSpreadsheet<T>(
  options: ReportExportOptions<T>,
  format: "xls" | "xlsx" | "csv" = "xls"
): void {
  const fileDate = new Date().toISOString().slice(0, 10);
  const cleanCategory = options.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  if (format === "xls" || format === "xlsx") {
    const xml = generateExcelWorkbookXml(options);
    const blob = new Blob([xml], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const fileName = `scripe-venue-report-${cleanCategory}-${fileDate}.xls`;
    triggerFileDownload(blob, fileName);
  } else {
    const csv = generateCsv(options);
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const fileName = `scripe-venue-report-${cleanCategory}-${fileDate}.csv`;
    triggerFileDownload(blob, fileName);
  }
}

function triggerFileDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
