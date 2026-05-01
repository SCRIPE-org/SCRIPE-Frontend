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
export type SubjectType = "Admin" | "User";

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

  copyWith(updates: Partial<DataSubjectRequestData>): DataSubjectRequest {
    return new DataSubjectRequest({ ...this.data, ...updates });
  }
}
