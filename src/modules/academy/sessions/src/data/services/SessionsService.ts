import { buildUrl } from "@core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type { SessionAction, SessionGroupContext, SessionListFilters, SessionSchedule } from "../../domain/entities/TrainingSession";
import type { TrainingSessionDto, TrainingSessionPageDto } from "../models/TrainingSessionDto";
import { SESSIONS_ENDPOINTS } from "./sessions.endpoints";

export class SessionsService {
  constructor(private readonly api: IApiService) {}

  list(filters: SessionListFilters, signal?: AbortSignal) {
    return this.api.get<TrainingSessionPageDto>(buildUrl(SESSIONS_ENDPOINTS.LIST, { ...filters }), undefined, signal);
  }

  get(id: string, signal?: AbortSignal) {
    return this.api.get<TrainingSessionDto>(SESSIONS_ENDPOINTS.BY_ID(id), undefined, signal);
  }

  groupContext(groupId: string, signal?: AbortSignal) {
    return this.api.get<SessionGroupContext>(SESSIONS_ENDPOINTS.GROUP_CONTEXT(groupId), undefined, signal);
  }

  create(schedule: SessionSchedule) {
    return this.api.post<TrainingSessionDto>(SESSIONS_ENDPOINTS.LIST, schedule);
  }

  reschedule(id: string, expectedVersion: string, schedule: SessionSchedule) {
    return this.api.put<TrainingSessionDto>(SESSIONS_ENDPOINTS.BY_ID(id), { ...schedule, expectedVersion });
  }

  transition(id: string, action: SessionAction, expectedVersion: string, reason?: string) {
    const payload = action === "cancel" ? { expectedVersion, reason } : { expectedVersion };
    return this.api.post<TrainingSessionDto>(SESSIONS_ENDPOINTS.TRANSITION(id, action), payload);
  }
}
