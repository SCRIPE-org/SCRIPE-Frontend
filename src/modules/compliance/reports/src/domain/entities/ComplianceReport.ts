/**
 * Compliance Report Domain Entity
 */

export type ReportStatus = "Pending" | "Generating" | "Ready" | "Failed";

/**
 * Domain model representing a Compliance Report Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ComplianceReportData {
  id: string;
  reportType: string;
  regulationCode: string;
  periodStart: string;
  periodEnd: string;
  status: ReportStatus;
  generatedAt: string | null;
  downloadUrl: string | null;
  title?: string;
}

/**
 * Domain model representing a Compliance Report structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class ComplianceReport {
  constructor(private readonly data: ComplianceReportData) {}

  get id() {
    return this.data.id;
  }
  get reportType() {
    return this.data.reportType ?? "";
  }
  get title() {
    return this.data.title ?? this.data.reportType ?? "";
  }
  get regulationCode() {
    return this.data.regulationCode ?? "";
  }
  get periodStart() {
    return this.data.periodStart ? new Date(this.data.periodStart) : null;
  }
  get periodEnd() {
    return this.data.periodEnd ? new Date(this.data.periodEnd) : null;
  }
  get status() {
    return this.data.status;
  }
  get isReady() {
    return this.data.status === "Ready";
  }
  get isPending() {
    return this.data.status === "Pending" || this.data.status === "Generating";
  }
  get generatedAt() {
    return this.data.generatedAt ? new Date(this.data.generatedAt) : null;
  }
  get downloadUrl() {
    return this.data.downloadUrl ?? null;
  }

  copyWith(updates: Partial<ComplianceReportData>): ComplianceReport {
    return new ComplianceReport({ ...this.data, ...updates });
  }
}

/**
 * Domain model representing a Generate Report Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface GenerateReportRequest {
  reportType: string;
  regulationCode?: string;
  periodStart?: string;
  periodEnd?: string;
}
