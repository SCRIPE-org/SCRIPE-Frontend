import { TrainingSession, type SessionListFilters } from "@modules/academy/sessions/src/domain/entities/TrainingSession";
import { AttendanceRequestError, type AttendanceCorrection, type BulkAttendanceIntent } from "../../domain/entities/Attendance";
import type { IAttendanceRepository } from "../../domain/interfaces/IAttendanceRepository";
import type { AttendanceService } from "../services/AttendanceService";

const failures = { 403: "forbidden", 404: "notFound", 409: "conflict", 400: "invalid", 422: "invalid" } as const;

export class AttendanceRepository implements IAttendanceRepository {
  constructor(private readonly service: AttendanceService) {}

  async list(filters: SessionListFilters, signal?: AbortSignal) {
    const page = await this.request(this.service.list(filters, signal));
    return { ...page, items: page.items.map((session) => new TrainingSession(session)) };
  }

  async get(sessionId: string, signal?: AbortSignal) {
    const register = await this.request(this.service.get(sessionId, signal));
    return { ...register, session: new TrainingSession(register.session) };
  }

  async record(sessionId: string, intent: BulkAttendanceIntent) {
    return (await this.request(this.service.record(sessionId, intent))).records;
  }

  correct(sessionId: string, athleteId: string, correction: AttendanceCorrection) {
    return this.request(this.service.correct(sessionId, athleteId, correction));
  }

  history(sessionId: string, athleteId: string, signal?: AbortSignal) {
    return this.request(this.service.history(sessionId, athleteId, signal));
  }

  private async request<T>(request: Promise<T>): Promise<T> {
    try {
      return await request;
    } catch (error) {
      const failure = error as { code?: string; status?: number; response?: { status?: number } } | null;
      if (failure?.code === "ERR_CANCELED") throw error;
      const status = failure?.response?.status ?? failure?.status;
      throw new AttendanceRequestError(failures[status as keyof typeof failures] ?? "unavailable");
    }
  }
}
