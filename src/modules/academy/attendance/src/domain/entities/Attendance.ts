import type { TrainingSession } from "@modules/academy/sessions/src/domain/entities/TrainingSession";

export const ATTENDANCE_STATUSES = ["Present", "Late", "AbsentExcused", "AbsentUnexcused", "Medical", "Remote"] as const;
export const ATTENDANCE_REASON_LIMIT = 500;
export const ATTENDANCE_BULK_LIMIT = 200;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface AttendanceRecord {
  athleteId: string;
  status: AttendanceStatus;
  reason: string | null;
  recordedBy: string;
  recordedAtUtc: string;
  version: string;
}

export interface AttendanceRow {
  athleteId: string;
  displayNameEn: string;
  displayNameAr: string;
  isEligible: boolean;
  attendance: AttendanceRecord | null;
}

export interface AttendanceRegister {
  session: TrainingSession;
  canRecord: boolean;
  canCorrect: boolean;
  rows: AttendanceRow[];
}

export interface AttendanceEntry {
  athleteId: string;
  status: AttendanceStatus;
  reason?: string;
}

export interface BulkAttendanceIntent {
  idempotencyKey: string;
  expectedSessionVersion: string;
  entries: AttendanceEntry[];
}

export interface AttendanceCorrection {
  expectedVersion: string;
  expectedSessionVersion: string;
  status: AttendanceStatus;
  reason?: string;
  correctionReason: string;
}

export interface AttendanceHistoryEntry {
  actorId: string;
  changedAtUtc: string;
  correctionReason: string;
  before: AttendanceRecord;
  after: AttendanceRecord;
}

export type AttendanceFailure = "forbidden" | "notFound" | "conflict" | "invalid" | "unavailable";

export class AttendanceRequestError extends Error {
  constructor(readonly kind: AttendanceFailure) {
    super(kind);
    this.name = "AttendanceRequestError";
  }
}
