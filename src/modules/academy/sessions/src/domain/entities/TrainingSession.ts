export const SESSION_STATUSES = ["Scheduled", "InProgress", "Completed", "Cancelled"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const SESSION_LOCATION_MODES = ["ExternalLocation", "PartnerReference", "InternalVenue"] as const;
export type SessionLocationMode = (typeof SESSION_LOCATION_MODES)[number];
export type SessionAction = "cancel" | "start" | "complete";

export interface SessionCoach {
  staffMemberId: string;
  fullName: string;
  isSubstitute: boolean;
}

export interface TrainingSessionData {
  id: string;
  groupId: string;
  groupNameEn: string;
  groupNameAr: string;
  offeringId: string;
  offeringNameEn: string;
  offeringNameAr: string;
  branchId: string;
  startUtc: string;
  endUtc: string;
  timeZoneId: string;
  objectivesEn: string | null;
  objectivesAr: string | null;
  locationMode: SessionLocationMode;
  externalLocationId: string | null;
  locationNameEn: string | null;
  locationNameAr: string | null;
  partnerReservationReference: string | null;
  venueReservationId: string | null;
  status: SessionStatus;
  cancellationReason: string | null;
  coaches: SessionCoach[];
  version: string;
  createdAt: string;
  modifiedAt: string | null;
}

export class TrainingSession {
  constructor(readonly data: Readonly<TrainingSessionData>) {}

  get id() { return this.data.id; }
  get status() { return this.data.status; }
  get version() { return this.data.version; }

  get canReschedule() { return this.status === "Scheduled"; }
  get canCancel() { return this.status === "Scheduled"; }
  get canStart() { return this.status === "Scheduled"; }
  get canComplete() { return this.status === "InProgress"; }

  groupName(language: "ar" | "en") {
    return language === "ar"
      ? this.data.groupNameAr || this.data.groupNameEn
      : this.data.groupNameEn || this.data.groupNameAr;
  }

  offeringName(language: "ar" | "en") {
    return language === "ar"
      ? this.data.offeringNameAr || this.data.offeringNameEn
      : this.data.offeringNameEn || this.data.offeringNameAr;
  }

  locationName(language: "ar" | "en") {
    return language === "ar"
      ? this.data.locationNameAr || this.data.locationNameEn
      : this.data.locationNameEn || this.data.locationNameAr;
  }
}

export interface SessionListFilters {
  page: number;
  pageSize: number;
  fromUtc?: string;
  toUtc?: string;
  branchId?: string;
  groupId?: string;
  status?: SessionStatus;
  coachStaffMemberId?: string;
}

export interface SessionPage {
  items: TrainingSession[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface SessionSchedule {
  groupId: string;
  startUtc: string;
  endUtc: string;
  timeZoneId: string;
  objectivesEn?: string | null;
  objectivesAr?: string | null;
  locationMode: SessionLocationMode;
  externalLocationId?: string | null;
  partnerReservationReference?: string | null;
  venueReservationId?: string | null;
  coachStaffMemberIds: string[];
  substituteCoachStaffMemberId?: string | null;
}

export interface SessionGroupContext {
  branchId: string;
  branchName: string;
  sportId: string;
  timeZoneId: string | null;
}

export class SessionRequestError extends Error {
  constructor(readonly kind: "forbidden" | "notFound" | "conflict" | "invalid" | "unavailable", readonly code?: string) {
    super(kind);
    this.name = "SessionRequestError";
  }
}
