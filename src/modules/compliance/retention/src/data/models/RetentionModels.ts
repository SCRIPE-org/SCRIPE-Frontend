/**
 * Retention Policy Data Models — Raw DTOs matching backend API response exactly.
 * NEVER used in presentation layer.
 */

export interface RetentionPolicyModel {
  id: string;
  policyId?: string;
  category: string;
  legalBasis?: string;
  retentionDays: number;
  minRetentionDays: number;
  maxRetentionDays: number;
  expiryAction: string;
  nextEvaluationAt: string;
  lastExecutionAt?: string;
  recordsProcessedLast?: number;
  isActive: boolean;
}

/**
 * Interface structure detailing the properties and attributes of Create Retention Policy Request.
 */
export interface CreateRetentionPolicyRequest {
  category: string;
  name: string;
  description?: string;
  retentionDays: number;
  expiryAction: string;
  isActive: boolean;
}
