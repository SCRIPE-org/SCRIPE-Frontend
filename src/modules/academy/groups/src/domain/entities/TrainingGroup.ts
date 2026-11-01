export type TrainingGroupStatus = "Draft" | "Active" | "Archived";
export type GroupMembershipStatus = "Active" | "Transferred" | "Ended";
export type GroupCoachRole = "HeadCoach" | "AssistantCoach";

export interface GroupCoach {
  id: string;
  groupId: string;
  staffMemberId: string;
  staffFullName?: string | null;
  staffEmail?: string | null;
  role: GroupCoachRole | string;
  assignedDate: string;
  unassignedDate?: string | null;
  isActive: boolean;
}

export interface TrainingGroup {
  id: string;
  offeringId: string;
  offeringNameEn?: string | null;
  offeringNameAr?: string | null;
  branchId?: string | null;
  nameEn: string;
  nameAr: string;
  code?: string | null;
  minCapacity: number;
  maxCapacity: number;
  activeMemberCount: number;
  status: TrainingGroupStatus | string;
  scheduleDescriptionEn?: string | null;
  scheduleDescriptionAr?: string | null;
  coaches?: GroupCoach[];
}

export interface GroupMembership {
  id: string;
  groupId: string;
  groupNameEn?: string | null;
  groupNameAr?: string | null;
  enrollmentId: string;
  athleteId: string;
  athleteNameEn?: string | null;
  athleteNameAr?: string | null;
  startDate: string;
  endDate?: string | null;
  status: GroupMembershipStatus | string;
  transferReason?: string | null;
}

export interface GroupRosterItem {
  membershipId: string;
  athleteId: string;
  athleteNameEn?: string | null;
  athleteNameAr?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  enrollmentId: string;
  enrollmentStatus: string;
  startDate: string;
  status: GroupMembershipStatus | string;
  guardianNameEn?: string | null;
  emergencyPhone?: string | null;
}

export interface CreateTrainingGroupPayload {
  offeringId: string;
  nameEn: string;
  nameAr: string;
  code?: string | null;
  maxCapacity: number;
  minCapacity?: number;
  scheduleDescriptionEn?: string | null;
  scheduleDescriptionAr?: string | null;
}

export interface UpdateTrainingGroupPayload {
  nameEn: string;
  nameAr: string;
  code?: string | null;
  minCapacity: number;
  maxCapacity: number;
  status: TrainingGroupStatus;
  scheduleDescriptionEn?: string | null;
  scheduleDescriptionAr?: string | null;
}

export interface AssignAthletePayload {
  enrollmentId: string;
  startDate?: string | null;
}

export interface TransferAthletePayload {
  targetGroupId: string;
  reason: string;
  effectiveDate?: string | null;
}

export interface AssignCoachPayload {
  staffMemberId: string;
  role: GroupCoachRole;
  assignedDate?: string | null;
}
