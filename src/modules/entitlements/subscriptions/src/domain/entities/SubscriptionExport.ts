/**
 * Subscription Export Domain Types
 */

export type ExportFormat = "csv" | "excel" | "pdf";

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

export interface ExportFileResult {
  blob: Blob;
  filename: string;
}
