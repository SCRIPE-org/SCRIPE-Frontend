"use client";

import type {
  ComplianceDashboardData,
  ConsentStatusData,
  DsrData,
  RetentionPolicyData,
} from "../entities/ComplianceEntities";
import type { DsrListParams } from "../../data/services/ComplianceService";

export interface IComplianceRepository {
  getDashboard(): Promise<ComplianceDashboardData>;
  getMyConsent(): Promise<ConsentStatusData[]>;
  recordConsent(payload: {
    purposeId: string;
    action: "Granted" | "Withdrawn";
    consentVersion: string;
    collectionMethod?: string;
  }): Promise<void>;
  getDsrList(params?: DsrListParams): Promise<{
    items: DsrData[];
    totalCount: number;
    page: number;
    pageSize: number;
  }>;
  getDsrById(id: string): Promise<DsrData>;
  submitDsr(
    payload: { requestType: string; regulationCode: string; requesterNotes?: string },
    subjectId: string,
    subjectEmail: string,
    subjectType?: string,
  ): Promise<{ id: string }>;
  reviewDsr(id: string, payload: { isApproved: boolean; resolution?: string }): Promise<void>;
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
