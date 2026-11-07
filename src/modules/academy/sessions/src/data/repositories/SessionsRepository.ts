import { SessionRequestError, TrainingSession, type SessionAction, type SessionListFilters, type SessionSchedule } from "../../domain/entities/TrainingSession";
import type { ISessionsRepository } from "../../domain/interfaces/ISessionsRepository";
import type { SessionsService } from "../services/SessionsService";

export class SessionsRepository implements ISessionsRepository {
  constructor(private readonly service: SessionsService) {}

  async list(filters: SessionListFilters, signal?: AbortSignal) {
    const page = await this.request(this.service.list(filters, signal));
    return { ...page, items: page.items.map((dto) => new TrainingSession(dto)) };
  }

  async get(id: string, signal?: AbortSignal) {
    return new TrainingSession(await this.request(this.service.get(id, signal)));
  }

  groupContext(groupId: string, signal?: AbortSignal) {
    return this.request(this.service.groupContext(groupId, signal));
  }

  async create(schedule: SessionSchedule) {
    return new TrainingSession(await this.request(this.service.create(schedule)));
  }

  async reschedule(id: string, expectedVersion: string, schedule: SessionSchedule) {
    return new TrainingSession(await this.request(this.service.reschedule(id, expectedVersion, schedule)));
  }

  async transition(id: string, action: SessionAction, expectedVersion: string, reason?: string) {
    return new TrainingSession(await this.request(this.service.transition(id, action, expectedVersion, reason)));
  }

  private async request<T>(request: Promise<T>): Promise<T> {
    try {
      return await request;
    } catch (error) {
      const failure = error as { code?: string; status?: number; details?: { errorCode?: string }; response?: { status?: number; data?: { errorCode?: string } } } | null;
      if (failure?.code === "ERR_CANCELED") throw error;
      const status = failure?.response?.status ?? failure?.status;
      const code = failure?.details?.errorCode ?? failure?.response?.data?.errorCode;
      if (status === 403) throw new SessionRequestError("forbidden", code);
      if (status === 404) throw new SessionRequestError("notFound", code);
      if (status === 409) throw new SessionRequestError("conflict", code);
      if (status === 400 || status === 422) throw new SessionRequestError("invalid", code);
      throw new SessionRequestError("unavailable", code);
    }
  }
}
