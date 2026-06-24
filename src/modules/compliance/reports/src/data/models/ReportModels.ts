/**
 * Report Data Models — Raw DTOs matching backend API response exactly.
 * NEVER used in presentation layer.
 */

export interface ReportModel {
  id: string;
  reportType: string;
  title: string;
  regulationCode: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  fileUrl: string | null;
  fileSizeBytes: number | null;
  /** Backend sends isReady (bool), not a status string */
  isReady: boolean;
  generatedAt: string | null;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for report list response.
 */
export interface ReportListResponse {
  items: ReportModel[];
  totalCount: number;
  page: number;
  pageSize: number;
}
