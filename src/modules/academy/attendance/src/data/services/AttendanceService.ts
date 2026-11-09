import { buildUrl, V1 } from "@core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type { TrainingSessionDto, TrainingSessionPageDto } from "@modules/academy/sessions/src/data/models/TrainingSessionDto";
import type { SessionListFilters } from "@modules/academy/sessions/src/domain/entities/TrainingSession";
import type { AttendanceCorrection, AttendanceHistoryEntry, AttendanceRecord, AttendanceRegister, BulkAttendanceIntent } from "../../domain/entities/Attendance";

const base = V1 + "/academy/attendance";
const sessionPath = (id: string) => base + "/" + encodeURIComponent(id);
const athletePath = (sessionId: string, athleteId: string) => sessionPath(sessionId) + "/athletes/" + encodeURIComponent(athleteId);
type AttendanceRegisterDto = Omit<AttendanceRegister, "session"> & { session: TrainingSessionDto };

export class AttendanceService {
  constructor(private readonly api: IApiService) {}

  list(filters: SessionListFilters, signal?: AbortSignal) {
    return this.api.get<TrainingSessionPageDto>(buildUrl(base, { ...filters }), undefined, signal);
  }

  get(sessionId: string, signal?: AbortSignal) {
    return this.api.get<AttendanceRegisterDto>(sessionPath(sessionId), undefined, signal);
  }

  record(sessionId: string, intent: BulkAttendanceIntent) {
    return this.api.post<{ records: AttendanceRecord[] }>(sessionPath(sessionId) + "/bulk", intent);
  }

  correct(sessionId: string, athleteId: string, correction: AttendanceCorrection) {
    return this.api.put<AttendanceRecord>(athletePath(sessionId, athleteId), correction);
  }

  history(sessionId: string, athleteId: string, signal?: AbortSignal) {
    return this.api.get<AttendanceHistoryEntry[]>(athletePath(sessionId, athleteId) + "/history", undefined, signal);
  }
}
