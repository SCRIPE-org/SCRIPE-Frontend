import type {
  TrainingGroup,
  GroupMembership,
  GroupCoach,
  AvailableCoach,
  GroupRosterItem,
  CreateTrainingGroupPayload,
  UpdateTrainingGroupPayload,
  AssignAthletePayload,
  TransferAthletePayload,
  AssignCoachPayload
} from "../entities/TrainingGroup";

export interface ITrainingGroupsService {
  getGroups(offeringId?: string, branchId?: string, status?: string): Promise<TrainingGroup[]>;
  getGroupById(id: string): Promise<TrainingGroup>;
  createGroup(payload: CreateTrainingGroupPayload): Promise<TrainingGroup>;
  updateGroup(id: string, payload: UpdateTrainingGroupPayload): Promise<TrainingGroup>;
  archiveGroup(id: string): Promise<void>;
  getRoster(groupId: string, activeOnly?: boolean): Promise<GroupRosterItem[]>;
  getAvailableCoaches(sportId?: string): Promise<AvailableCoach[]>;
  assignAthlete(groupId: string, payload: AssignAthletePayload): Promise<GroupMembership>;
  removeAthlete(groupId: string, membershipId: string, reason?: string): Promise<void>;
  transferAthlete(groupId: string, membershipId: string, payload: TransferAthletePayload): Promise<GroupMembership>;
  assignCoach(groupId: string, payload: AssignCoachPayload): Promise<GroupCoach>;
  removeCoach(groupId: string, coachId: string): Promise<void>;
}
