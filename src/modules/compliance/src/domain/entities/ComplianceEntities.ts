"use client";

export interface RegulationProfileData {
  id: string;
  code: string;
  name: string;
  jurisdiction: string | null;
  dsrDeadlineDays: number;
  referenceUrl: string | null;
  isActive: boolean;
  purposes: ConsentPurposeData[];
}

export class RegulationProfile {
  constructor(private readonly data: RegulationProfileData) {}
  get id() { return this.data.id; }
  get code() { return this.data.code; }
  get name() { return this.data.name; }
  get jurisdiction() { return this.data.jurisdiction; }
  get dsrDeadlineDays() { return this.data.dsrDeadlineDays; }
  get referenceUrl() { return this.data.referenceUrl; }
  get isActive() { return this.data.isActive; }
  get purposes() { return this.data.purposes; }
}

export interface ConsentPurposeData {
  id: string;
  key: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  legalBasis: string;
  isRequired: boolean;
  sortOrder: number;
}

export type ConsentAction = "Granted" | "Withdrawn";
export type DsrRequestType = "Export" | "Erasure" | "Rectification" | "Restriction";
export type DsrStatus =
  | "Pending" | "InReview" | "Approved" | "Processing"
  | "PartiallyCompleted" | "Completed" | "Rejected" | "Cancelled";
export type SubjectType = "Admin" | "User";

export interface ConsentStatusData {
  purposeId: string;
  purposeKey: string;
  purposeName: string;
  currentAction: ConsentAction;
  requiresReConsent: boolean;
  lastUpdatedAt: string;
}

export class ConsentStatus {
  constructor(private readonly data: ConsentStatusData) {}
  get purposeId() { return this.data.purposeId; }
  get purposeKey() { return this.data.purposeKey; }
  get purposeName() { return this.data.purposeName; }
  get currentAction() { return this.data.currentAction; }
  get isGranted() { return this.data.currentAction === "Granted"; }
  get requiresReConsent() { return this.data.requiresReConsent; }
  get lastUpdatedAt() { return new Date(this.data.lastUpdatedAt); }
}

export interface DsrData {
  id: string;
  subjectEmail: string;
  subjectType: SubjectType;
  requestType: DsrRequestType;
  status: DsrStatus;
  regulationCode: string;
  deadline: string;
  daysRemaining: number;
  slaPercent: number;
  createdAt: string;
}

export class DataSubjectRequest {
  constructor(private readonly data: DsrData) {}
  get id() { return this.data.id; }
  get subjectEmail() { return this.data.subjectEmail; }
  get subjectType() { return this.data.subjectType; }
  get requestType() { return this.data.requestType; }
  get status() { return this.data.status; }
  get regulationCode() { return this.data.regulationCode; }
  get deadline() { return new Date(this.data.deadline); }
  get daysRemaining() { return this.data.daysRemaining; }
  get slaPercent() { return this.data.slaPercent; }
  get isOverdue() { return this.data.daysRemaining <= 0 && this.data.status !== "Completed"; }
  get isCompleted() { return this.data.status === "Completed"; }
  get slaColor(): "green" | "yellow" | "orange" | "red" {
    if (this.data.slaPercent >= 90) return "red";
    if (this.data.slaPercent >= 75) return "orange";
    if (this.data.slaPercent >= 50) return "yellow";
    return "green";
  }
  get createdAt() { return new Date(this.data.createdAt); }
}

export interface ComplianceDashboardData {
  openDsrCount: number;
  pendingDsrCount: number;
  overdueDsrCount: number;
  slaCompliancePercent: number;
  consentOptInRate: number;
  subjectsRequiringReConsent: number;
  regulationCoverage: RegulationCoverageData[];
  recentDsrs: DsrData[];
}

export interface RegulationCoverageData {
  code: string;
  name: string;
  isActive: boolean;
  tenantsUsingCount: number;
}

export interface RetentionPolicyData {
  id: string;
  category: string;
  retentionDays: number;
  minRetentionDays: number;
  maxRetentionDays: number;
  expiryAction: string;
  nextEvaluationAt: string;
  isActive: boolean;
}

export class RetentionPolicy {
  constructor(private readonly data: RetentionPolicyData) {}
  get id() { return this.data.id; }
  get category() { return this.data.category; }
  get retentionDays() { return this.data.retentionDays; }
  get minRetentionDays() { return this.data.minRetentionDays; }
  get maxRetentionDays() { return this.data.maxRetentionDays; }
  get expiryAction() { return this.data.expiryAction; }
  get isActive() { return this.data.isActive; }
  get retentionYears() { return (this.data.retentionDays / 365).toFixed(1); }
}
