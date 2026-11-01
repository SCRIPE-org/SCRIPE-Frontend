import type { ITrainingGroupsRepository } from "../../domain/interfaces/ITrainingGroupsRepository";
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

export class TrainingGroupsRepository implements ITrainingGroupsRepository {
  constructor(private readonly service: ITrainingGroupsService) {}

  async getGroups(offeringId?: string, branchId?: string, status?: string): Promise<TrainingGroup[]> {
    return await this.service.getGroups(offeringId, branchId, status);
  }

  async getGroupById(id: string): Promise<TrainingGroup> {
    return await this.service.getGroupById(id);
  }

  async createGroup(payload: CreateTrainingGroupPayload): Promise<TrainingGroup> {
    return await this.service.createGroup(payload);
  }

  async updateGroup(id: string, payload: UpdateTrainingGroupPayload): Promise<TrainingGroup> {
    return await this.service.updateGroup(id, payload);
  }

  async archiveGroup(id: string): Promise<void> {
    return await this.service.archiveGroup(id);
  }

  async getRoster(groupId: string, activeOnly = true): Promise<GroupRosterItem[]> {
    return await this.service.getRoster(groupId, activeOnly);
  }

  async assignAthlete(groupId: string, payload: AssignAthletePayload): Promise<GroupMembership> {
    return await this.service.assignAthlete(groupId, payload);
  }

  async removeAthlete(groupId: string, membershipId: string, reason?: string): Promise<void> {
    return await this.service.removeAthlete(groupId, membershipId, reason);
  }

  async transferAthlete(groupId: string, membershipId: string, payload: TransferAthletePayload): Promise<GroupMembership> {
    return await this.service.transferAthlete(groupId, membershipId, payload);
  }

  async assignCoach(groupId: string, payload: AssignCoachPayload): Promise<GroupCoach> {
    return await this.service.assignCoach(groupId, payload);
  }

  async removeCoach(groupId: string, coachId: string): Promise<void> {
    return await this.service.removeCoach(groupId, coachId);
  }
}
