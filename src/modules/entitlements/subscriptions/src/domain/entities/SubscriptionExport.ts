/**
 * Subscription Export Domain Types
 */

export type ExportFormat = "csv" | "excel" | "pdf";

/**
 * Domain model representing a Export Params structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ExportParams {
  format: ExportFormat;
  statusFilter?: string;
  typeFilter?: string;
  displayCurrency?: string;
  dateFrom?: string;
  dateTo?: string;
  expiringInDays?: number;
  editionFilter?: string;
}

/**
 * Domain model representing a Export File Result structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ExportFileResult {
  blob: Blob;
  filename: string;
}
