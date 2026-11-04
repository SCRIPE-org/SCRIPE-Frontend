export type TrialStatus =
  | "Requested"
  | "Scheduled"
  | "Attended"
  | "Evaluated"
  | "Accepted"
  | "Waitlisted"
  | "Rejected"
  | "Cancelled";

export interface AcademyTrial {
  id: string;
  athleteId: string;
  athleteNameEn?: string | null;
  athleteNameAr?: string | null;
  offeringId: string;
  offeringNameEn?: string | null;
  offeringNameAr?: string | null;
  scheduledDate: string;
  scheduledTime?: string | null;
  status: TrialStatus;
  evaluatingCoachId?: string | null;
  technicalRecommendation?: string | null;
  recommendedLevel?: string | null;
  technicalScore?: number | null;
  technicalNotes?: string | null;
  evaluatedAt?: string | null;
  adminDecisionNotes?: string | null;
  decidedBy?: string | null;
  decidedAt?: string | null;
}

export interface RequestTrialPayload {
  athleteId: string;
  offeringId: string;
  scheduledDate: string;
  scheduledTime?: string | null;
}

export interface SubmitEvaluationPayload {
  technicalRecommendation: string;
  recommendedLevel?: string | null;
  technicalScore?: number | null;
  technicalNotes?: string | null;
}

export interface DecideTrialPayload {
  approved: boolean;
  waitlisted: boolean;
  adminDecisionNotes?: string | null;
}
