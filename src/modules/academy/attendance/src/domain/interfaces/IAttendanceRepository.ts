import type { SessionListFilters, SessionPage } from "@modules/academy/sessions/src/domain/entities/TrainingSession";
import type { AttendanceCorrection, AttendanceHistoryEntry, AttendanceRecord, AttendanceRegister, BulkAttendanceIntent } from "../entities/Attendance";

export interface IAttendanceRepository {
  list(filters: SessionListFilters, signal?: AbortSignal): Promise<SessionPage>;
  get(sessionId: string, signal?: AbortSignal): Promise<AttendanceRegister>;
  record(sessionId: string, intent: BulkAttendanceIntent): Promise<AttendanceRecord[]>;
  correct(sessionId: string, athleteId: string, correction: AttendanceCorrection): Promise<AttendanceRecord>;
  history(sessionId: string, athleteId: string, signal?: AbortSignal): Promise<AttendanceHistoryEntry[]>;
}
