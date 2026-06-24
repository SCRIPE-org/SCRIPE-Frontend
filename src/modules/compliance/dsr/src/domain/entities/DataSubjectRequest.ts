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
 * Type declaration definition describing the schema of subject type.
 */
export type SubjectType = "Admin" | "User";

/**
 * Interface structure detailing the properties and attributes of Dsr Status History.
 */
export interface DsrStatusHistory {
  fromStatus: string;
  toStatus: string;
  changedByAdminId?: string;
  notes?: string;
  occurredAt: string;
}

/**
 * Interface structure detailing the properties and attributes of Dsr Module Execution.
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
 * Interface structure detailing the properties and attributes of Data Subject Request Data.
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
}

/**
 * Domain entity class representing a Data Subject Request.
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
    return (this.data as any).dsrDeadlineDays ?? 0;
  }
  get assignedToAdminId() {
    return (this.data as any).assignedToAdminId ?? null;
  }
  get exportFileUrl() {
    return (this.data as any).exportFileUrl ?? null;
  }
  get erasureConfirmed() {
    return (this.data as any).erasureConfirmed ?? false;
  }
  get erasureExecuteAfter() {
    return (this.data as any).erasureExecuteAfter
      ? new Date((this.data as any).erasureExecuteAfter)
      : null;
  }
  get requesterNotes() {
    return (this.data as any).requesterNotes ?? null;
  }
  get statusHistory(): DsrStatusHistory[] {
    return (this.data as any).statusHistory ?? [];
  }
  get moduleExecutions(): DsrModuleExecution[] {
    return (this.data as any).moduleExecutions ?? [];
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
