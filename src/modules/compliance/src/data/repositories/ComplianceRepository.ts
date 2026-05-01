"use client";

import type { IComplianceRepository } from "../../domain/interfaces/IComplianceRepository";
import type { IComplianceService } from "../../domain/interfaces/IComplianceService";
import type { ComplianceDashboardData, ConsentStatusData, DsrData, RetentionPolicyData } from "../../domain/entities/ComplianceEntities";
import type { DsrListParams } from "../services/ComplianceService";

export class ComplianceRepository implements IComplianceRepository {
  constructor(private readonly service: IComplianceService) {}

  async getDashboard(): Promise<ComplianceDashboardData> {
    return this.service.getDashboard();
  }

  async getMyConsent(): Promise<ConsentStatusData[]> {
    return this.service.getMyConsent();
  }

  async recordConsent(payload: {
    purposeId: string;
    action: "Granted" | "Withdrawn";
    consentVersion: string;
    collectionMethod?: string;
  }): Promise<void> {
    return this.service.recordConsent(payload);
  }

  async getDsrList(params: DsrListParams = {}): Promise<{
    items: DsrData[];
    totalCount: number;
    page: number;
    pageSize: number;
  }> {
    return this.service.getDsrList(params);
  }

  async getDsrById(id: string): Promise<DsrData> {
    return this.service.getDsrById(id);
  }

  async submitDsr(
    payload: { requestType: string; regulationCode: string; requesterNotes?: string },
    subjectId: string,
    subjectEmail: string,
    subjectType?: string,
  ): Promise<{ id: string }> {
    return this.service.submitDsr(payload, subjectId, subjectEmail, subjectType);
  }

  async reviewDsr(id: string, payload: { isApproved: boolean; resolution?: string }): Promise<void> {
    return this.service.reviewDsr(id, payload);
  }

  async confirmErasure(id: string): Promise<void> {
    return this.service.confirmErasure(id);
  }

  async cancelDsr(id: string, reason?: string): Promise<void> {
    return this.service.cancelDsr(id, reason);
  }

  async getRetentionPolicies(): Promise<RetentionPolicyData[]> {
    return this.service.getRetentionPolicies();
  }

  async updateRetentionPolicy(payload: {
    policyId: string;
    retentionDays: number;
    expiryAction: string;
    isActive: boolean;
  }): Promise<void> {
    return this.service.updateRetentionPolicy(payload);
  }

  async generateReport(payload: {
    reportType: string;
    regulationCode?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<void> {
    return this.service.generateReport(payload);
  }
}
