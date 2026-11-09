import type {
  SessionAction, SessionGroupContext, SessionListFilters, SessionPage, SessionSchedule, TrainingSession,
} from "../entities/TrainingSession";

export interface ISessionsRepository {
  list(filters: SessionListFilters, signal?: AbortSignal): Promise<SessionPage>;
  get(id: string, signal?: AbortSignal): Promise<TrainingSession>;
  groupContext(groupId: string, signal?: AbortSignal): Promise<SessionGroupContext>;
  create(schedule: SessionSchedule): Promise<TrainingSession>;
  reschedule(id: string, expectedVersion: string, schedule: SessionSchedule): Promise<TrainingSession>;
  transition(id: string, action: SessionAction, expectedVersion: string, reason?: string): Promise<TrainingSession>;
}
