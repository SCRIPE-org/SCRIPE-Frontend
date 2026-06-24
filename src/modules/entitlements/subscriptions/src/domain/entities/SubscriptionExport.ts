/**
 * Subscription Export Domain Types
 */

export type ExportFormat = "csv" | "excel" | "pdf";

/**
 * Interface structure detailing the properties and attributes of Export Params.
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
 * Interface structure detailing the properties and attributes of Export File Result.
 */
export interface ExportFileResult {
  blob: Blob;
  filename: string;
}
