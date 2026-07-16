/**
 * Retention Policy Domain Entity
 */

export type ExpiryAction = "Anonymize" | "Delete";

/**
 * Domain model representing a Retention Policy Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface RetentionPolicyData {
  id: string;
  policyId?: string;
  category: string;
  legalBasis?: string;
  retentionDays: number;
  minRetentionDays: number;
  maxRetentionDays: number;
  expiryAction: ExpiryAction | string;
  nextEvaluationAt: string;
  lastExecutionAt?: string;
  recordsProcessedLast?: number;
  isActive: boolean;
}

/**
 * Domain model representing a Retention Policy structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class RetentionPolicy {
  constructor(private readonly data: RetentionPolicyData) {}

  get id() {
    return this.data.id;
  }
  get policyId() {
    return this.data.policyId ?? this.data.id;
  }
  get category() {
    return this.data.category ?? "";
  }
  get legalBasis() {
    return this.data.legalBasis ?? "";
  }
  get retentionDays() {
    return this.data.retentionDays ?? 0;
  }
  get minRetentionDays() {
    return this.data.minRetentionDays ?? 0;
  }
  get maxRetentionDays() {
    return this.data.maxRetentionDays ?? 0;
  }
  get expiryAction() {
    return this.data.expiryAction as ExpiryAction;
  }
  get isAnonymize() {
    return this.data.expiryAction === "Anonymize";
  }
  get nextEvaluationAt() {
    return this.data.nextEvaluationAt ? new Date(this.data.nextEvaluationAt) : null;
  }
  get lastExecutionAt() {
    return this.data.lastExecutionAt ? new Date(this.data.lastExecutionAt) : null;
  }
  get recordsProcessedLast() {
    return this.data.recordsProcessedLast ?? null;
  }
  get isActive() {
    return this.data.isActive ?? false;
  }
  get retentionYears() {
    return (this.data.retentionDays / 365).toFixed(1);
  }

  copyWith(updates: Partial<RetentionPolicyData>): RetentionPolicy {
    return new RetentionPolicy({ ...this.data, ...updates });
  }
}

/**
 * Domain model representing a Update Retention Policy Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface UpdateRetentionPolicyRequest {
  policyId: string;
  retentionDays: number;
  expiryAction: string;
  isActive: boolean;
}

/**
 * Domain model representing a Create Retention Policy Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CreateRetentionPolicyRequest {
  category: string;
  name: string;
  description?: string;
  retentionDays: number;
  expiryAction: string;
  isActive: boolean;
}
