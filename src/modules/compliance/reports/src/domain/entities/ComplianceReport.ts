/**
 * Compliance Report Domain Entity
 */

export type ReportStatus = "Pending" | "Generating" | "Ready" | "Failed";

export interface ComplianceReportData {
  id: string;
  reportType: string;
  regulationCode: string;
  periodStart: string;
  periodEnd: string;
  status: ReportStatus;
  generatedAt: string | null;
  downloadUrl: string | null;
  requestedBy?: string;
  requestedAt?: string;
}

export class ComplianceReport {
  constructor(private readonly data: ComplianceReportData) {}

  get id() { return this.data.id; }
  get reportType() { return this.data.reportType ?? ""; }
  get regulationCode() { return this.data.regulationCode ?? ""; }
  get periodStart() { return this.data.periodStart ? new Date(this.data.periodStart) : null; }
  get periodEnd() { return this.data.periodEnd ? new Date(this.data.periodEnd) : null; }
  get status() { return this.data.status; }
  get isReady() { return this.data.status === "Ready"; }
  get isPending() { return this.data.status === "Pending" || this.data.status === "Generating"; }
  get generatedAt() { return this.data.generatedAt ? new Date(this.data.generatedAt) : null; }
  get downloadUrl() { return this.data.downloadUrl ?? null; }
  get requestedBy() { return this.data.requestedBy ?? null; }
  get requestedAt() { return this.data.requestedAt ? new Date(this.data.requestedAt) : null; }

  copyWith(updates: Partial<ComplianceReportData>): ComplianceReport {
    return new ComplianceReport({ ...this.data, ...updates });
  }
}

export interface GenerateReportRequest {
  reportType: string;
  regulationCode?: string;
  periodStart?: string;
  periodEnd?: string;
}
