import {
  ATTENDANCE_REASON_LIMIT,
  type AttendanceEntry,
  type AttendanceRow,
  type AttendanceStatus,
} from "./entities/Attendance";

export interface AttendanceMark {
  status: AttendanceStatus;
  reason: string;
}

export type AttendanceDraft = Partial<Record<string, AttendanceMark>>;

export function attendanceReasonRequired(status: AttendanceStatus) {
  return status === "AbsentExcused" || status === "Medical";
}

export function attendanceReasonValid({ status, reason }: AttendanceMark) {
  const length = reason.trim().length;
  return length <= ATTENDANCE_REASON_LIMIT && (length > 0 || !attendanceReasonRequired(status));
}

export function canMarkAttendance(row: AttendanceRow) {
  return row.isEligible && !row.attendance;
}

export function changeAttendanceMark(draft: AttendanceDraft, id: string, status?: AttendanceStatus): AttendanceDraft {
  const updated = { ...draft };
  if (status) updated[id] = { status, reason: status === "Present" ? "" : draft[id]?.reason ?? "" };
  else delete updated[id];
  return updated;
}

export function markAllPresent(draft: AttendanceDraft, rows: AttendanceRow[]): AttendanceDraft {
  const updated = { ...draft };
  for (const row of rows) {
    if (canMarkAttendance(row) && !updated[row.athleteId]) updated[row.athleteId] = { status: "Present", reason: "" };
  }
  return updated;
}

export function reconcileDraft(draft: AttendanceDraft, rows: AttendanceRow[]): AttendanceDraft {
  const eligibleIds = new Set(rows.filter(canMarkAttendance).map((row) => row.athleteId));
  return Object.fromEntries(Object.entries(draft).filter(([id]) => eligibleIds.has(id)));
}

export function buildBulkAttendance(draft: AttendanceDraft, rows: AttendanceRow[]) {
  const entries: AttendanceEntry[] = [];
  const invalidAthletes: string[] = [];
  for (const row of rows) {
    const { athleteId } = row;
    const mark = draft[athleteId];
    if (!canMarkAttendance(row) || !mark) continue;
    if (!attendanceReasonValid(mark)) {
      invalidAthletes.push(athleteId);
      continue;
    }
    const reason = mark.reason.trim();
    entries.push({ athleteId, status: mark.status, ...(reason ? { reason } : {}) });
  }
  return { entries, invalidAthletes };
}
