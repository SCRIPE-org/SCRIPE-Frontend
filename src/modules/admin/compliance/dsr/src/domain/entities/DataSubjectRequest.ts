/**
 * DSR Domain Entities
 *
 * Rich domain model for Data Subject Requests.
 */

export type DsrRequestType = "Export" | "Erasure" | "Rectification" | "Restriction";
export type DsrStatus =
  | "Pending"
  | "InReview"
  | "Approved"
  | "Processing"
  | "PartiallyCompleted"
  | "Completed"
  | "Rejected"
  | "Cancelled";
/**
 * Domain model representing a Subject Type structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type SubjectType = "Admin" | "User";

/**
 * Domain model representing a Dsr Status History structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DsrStatusHistory {
  fromStatus: string;
  toStatus: string;
  changedByAdminId?: string;
  notes?: string;
  occurredAt: string;
}

/**
 * Domain model representing a Dsr Module Execution structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DsrModuleExecution {
  moduleName: string;
  isCompleted: boolean;
  processedCount: number;
  errorMessage?: string;
  retryCount: number;
  completedAt?: string;
}

/**
 * Domain model representing a Data Subject Request Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DataSubjectRequestData {
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
  submittedAt?: string;
  completedAt?: string;
  reviewedBy?: string;
  notes?: string;
  resolution?: string;
  dsrDeadlineDays?: number;
  assignedToAdminId?: string;
  exportFileUrl?: string;
  erasureConfirmed?: boolean;
  erasureExecuteAfter?: string;
  requesterNotes?: string;
  statusHistory?: DsrStatusHistory[];
  moduleExecutions?: DsrModuleExecution[];
}

/**
 * Domain model representing a Data Subject Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class DataSubjectRequest {
  constructor(private readonly data: DataSubjectRequestData) {}

  get id() {
    return this.data.id;
  }
  get subjectEmail() {
    return this.data.subjectEmail ?? "";
  }
  get subjectType() {
    return this.data.subjectType;
  }
  get requestType() {
    return this.data.requestType;
  }
  get status() {
    return this.data.status;
  }
  get regulationCode() {
    return this.data.regulationCode ?? "";
  }
  get deadline() {
    return new Date(this.data.deadline);
  }
  get daysRemaining() {
    return this.data.daysRemaining ?? 0;
  }
  get slaPercent() {
    return this.data.slaPercent ?? 0;
  }
  get isOverdue() {
    return (
      this.data.daysRemaining <= 0 &&
      this.data.status !== "Completed" &&
      this.data.status !== "Cancelled"
    );
  }
  get isCompleted() {
    return this.data.status === "Completed";
  }
  get slaColor(): "green" | "yellow" | "orange" | "red" {
    if (this.data.slaPercent >= 90) return "red";
    if (this.data.slaPercent >= 75) return "orange";
    if (this.data.slaPercent >= 50) return "yellow";
    return "green";
  }
  get createdAt() {
    return new Date(this.data.createdAt);
  }
  get submittedAt() {
    return this.data.submittedAt ?? this.data.createdAt;
  }
  get completedAt() {
    return this.data.completedAt ?? null;
  }
  get reviewedBy() {
    return this.data.reviewedBy ?? null;
  }
  get notes() {
    return this.data.notes ?? null;
  }
  get resolution() {
    return this.data.resolution ?? null;
  }

  // Detail properties
  get dsrDeadlineDays() {
    return this.data.dsrDeadlineDays ?? 0;
  }
  get assignedToAdminId() {
    return this.data.assignedToAdminId ?? null;
  }
  get exportFileUrl() {
    return this.data.exportFileUrl ?? null;
  }
  get erasureConfirmed() {
    return this.data.erasureConfirmed ?? false;
  }
  get erasureExecuteAfter() {
    return this.data.erasureExecuteAfter ? new Date(this.data.erasureExecuteAfter) : null;
  }
  get requesterNotes() {
    return this.data.requesterNotes ?? null;
  }
  get statusHistory(): DsrStatusHistory[] {
    return this.data.statusHistory ?? [];
  }
  get moduleExecutions(): DsrModuleExecution[] {
    return this.data.moduleExecutions ?? [];
  }

  get canConfirmErasure() {
    return this.requestType === "Erasure" && this.status === "Approved" && !this.erasureConfirmed;
  }

  get canDownloadExport() {
    return this.requestType === "Export" && this.status === "Completed" && !!this.exportFileUrl;
  }

  copyWith(updates: Partial<DataSubjectRequestData>): DataSubjectRequest {
    return new DataSubjectRequest({ ...this.data, ...updates });
  }
}
