import type { IApiService } from "@/core/interfaces/api.interface";
import type { ITrainingGroupsService } from "../../domain/interfaces/ITrainingGroupsService";
import type {
  TrainingGroup,
  GroupMembership,
  GroupCoach,
  GroupRosterItem,
  CreateTrainingGroupPayload,
  UpdateTrainingGroupPayload,
  AssignAthletePayload,
  TransferAthletePayload,
  AssignCoachPayload
} from "../../domain/entities/TrainingGroup";
import { TRAINING_GROUPS_ENDPOINTS } from "./training-groups.endpoints";

export class TrainingGroupsService implements ITrainingGroupsService {
  constructor(private readonly api: IApiService) {}

  async getGroups(offeringId?: string, branchId?: string, status?: string): Promise<TrainingGroup[]> {
    const url = TRAINING_GROUPS_ENDPOINTS.LIST(offeringId, branchId, status);
    return await this.api.get<TrainingGroup[]>(url);
  }

  async getGroupById(id: string): Promise<TrainingGroup> {
    const url = TRAINING_GROUPS_ENDPOINTS.GET_BY_ID(id);
    return await this.api.get<TrainingGroup>(url);
  }

  async createGroup(payload: CreateTrainingGroupPayload): Promise<TrainingGroup> {
    const url = TRAINING_GROUPS_ENDPOINTS.CREATE();
    return await this.api.post<TrainingGroup>(url, payload);
  }

  async updateGroup(id: string, payload: UpdateTrainingGroupPayload): Promise<TrainingGroup> {
    const url = TRAINING_GROUPS_ENDPOINTS.UPDATE(id);
    return await this.api.put<TrainingGroup>(url, payload);
  }

  async archiveGroup(id: string): Promise<void> {
    const url = TRAINING_GROUPS_ENDPOINTS.ARCHIVE(id);
    await this.api.delete<void>(url);
  }

  async getRoster(groupId: string, activeOnly = true): Promise<GroupRosterItem[]> {
    const url = TRAINING_GROUPS_ENDPOINTS.ROSTER(groupId, activeOnly);
    return await this.api.get<GroupRosterItem[]>(url);
  }

  async assignAthlete(groupId: string, payload: AssignAthletePayload): Promise<GroupMembership> {
    const url = TRAINING_GROUPS_ENDPOINTS.ASSIGN_ATHLETE(groupId);
    return await this.api.post<GroupMembership>(url, payload);
  }

  async removeAthlete(groupId: string, membershipId: string, reason?: string): Promise<void> {
    const url = TRAINING_GROUPS_ENDPOINTS.REMOVE_ATHLETE(groupId, membershipId, reason);
    await this.api.delete<void>(url);
  }

  async transferAthlete(groupId: string, membershipId: string, payload: TransferAthletePayload): Promise<GroupMembership> {
    const url = TRAINING_GROUPS_ENDPOINTS.TRANSFER_ATHLETE(groupId, membershipId);
    return await this.api.post<GroupMembership>(url, payload);
  }

  async assignCoach(groupId: string, payload: AssignCoachPayload): Promise<GroupCoach> {
    const url = TRAINING_GROUPS_ENDPOINTS.ASSIGN_COACH(groupId);
    return await this.api.post<GroupCoach>(url, payload);
  }

  async removeCoach(groupId: string, coachId: string): Promise<void> {
    const url = TRAINING_GROUPS_ENDPOINTS.REMOVE_COACH(groupId, coachId);
    await this.api.delete<void>(url);
  }
}
