/**
 * Dashboard Domain Entity
 *
 * Rich domain model for compliance dashboard data.
 * Never exposes raw DTO shapes — only typed getters.
 */

export interface RegulationCoverageData {
  code: string;
  name: string;
  isActive: boolean;
  tenantsUsingCount: number;
}

export interface DashboardData {
  openDsrCount: number;
  pendingDsrCount: number;
  overdueDsrCount: number;
  slaCompliancePercent: number;
  consentOptInRate: number;
  subjectsRequiringReConsent: number;
  regulationCoverage: RegulationCoverageData[];
}

export class ComplianceDashboard {
  constructor(private readonly data: DashboardData) {}

  get openDsrCount() { return this.data.openDsrCount ?? 0; }
  get pendingDsrCount() { return this.data.pendingDsrCount ?? 0; }
  get overdueDsrCount() { return this.data.overdueDsrCount ?? 0; }
  get slaCompliancePercent() { return this.data.slaCompliancePercent ?? 0; }
  get slaComplianceDisplay() { return `${this.data.slaCompliancePercent?.toFixed(0) ?? "0"}%`; }
  get consentOptInRate() { return this.data.consentOptInRate ?? 0; }
  get consentOptInDisplay() { return `${this.data.consentOptInRate ?? 0}%`; }
  get subjectsRequiringReConsent() { return this.data.subjectsRequiringReConsent ?? 0; }
  get regulationCoverage() { return this.data.regulationCoverage ?? []; }
  get activeRegulations() { return this.data.regulationCoverage?.filter(r => r.isActive) ?? []; }

  copyWith(updates: Partial<DashboardData>): ComplianceDashboard {
    return new ComplianceDashboard({ ...this.data, ...updates });
  }
}
