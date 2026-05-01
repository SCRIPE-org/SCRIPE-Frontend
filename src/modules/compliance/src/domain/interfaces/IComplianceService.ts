"use client";

import type {
  ComplianceDashboardData,
  ConsentStatusData,
  DsrData,
  RetentionPolicyData,
} from "../../domain/entities/ComplianceEntities";
import type {
  DsrListParams,
  DsrListResult,
  RecordConsentPayload,
  ReviewDsrPayload,
  SubmitDsrPayload,
} from "../../data/services/ComplianceService";

export interface IComplianceService {
  getDashboard(): Promise<ComplianceDashboardData>;
  getRegulations(): Promise<unknown[]>;
  getMyConsent(): Promise<ConsentStatusData[]>;
  recordConsent(payload: RecordConsentPayload): Promise<void>;
  getDsrList(params?: DsrListParams): Promise<DsrListResult>;
  getDsrById(id: string): Promise<DsrData>;
  submitDsr(payload: SubmitDsrPayload, subjectId: string, subjectEmail: string, subjectType?: string): Promise<{ id: string }>;
  reviewDsr(id: string, payload: ReviewDsrPayload): Promise<void>;
  confirmErasure(id: string): Promise<void>;
  cancelDsr(id: string, reason?: string): Promise<void>;
  getRetentionPolicies(): Promise<RetentionPolicyData[]>;
  updateRetentionPolicy(payload: {
    policyId: string;
    retentionDays: number;
    expiryAction: string;
    isActive: boolean;
  }): Promise<void>;
  generateReport(payload: {
    reportType: string;
    regulationCode?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<void>;
}
