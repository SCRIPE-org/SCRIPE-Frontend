/**
 * Report Data Models — Raw DTOs matching backend API response exactly.
 * NEVER used in presentation layer.
 */

export interface ReportModel {
  id: string;
  reportType: string;
  regulationCode: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  generatedAt: string | null;
  downloadUrl: string | null;
  requestedBy?: string;
  requestedAt?: string;
}
