/**
 * Dashboard Data Models — Raw DTOs matching backend API response exactly.
 * NEVER used in presentation layer.
 */

export interface RegulationCoverageModel {
  code: string;
  name: string;
  isActive: boolean;
  tenantsUsingCount: number;
}

/**
 * Interface structure detailing the properties and attributes of Dashboard Model.
 */
export interface DashboardModel {
  openDsrCount: number;
  pendingDsrCount: number;
  overdueDsrCount: number;
  slaCompliancePercent: number;
  consentOptInRate: number;
  subjectsRequiringReConsent: number;
  regulationCoverage: RegulationCoverageModel[];
}
