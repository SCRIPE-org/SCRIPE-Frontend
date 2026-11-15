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
  athleteDateOfBirth?: string | null;
  athleteCalculatedAge?: number | null;
  athleteGender?: string | null;
  athletePrimarySport?: string | null;
  overallScore?: number | null;
  rubricBreakdownJson?: string | null;
}

export interface RubricCriterionScorePayload {
  key: string;
  labelEn?: string | null;
  labelAr?: string | null;
  weightPercent: number;
  score: number;
}

export interface RubricCriterionSnapshot {
  key: string;
  label: string;
  labelEn?: string;
  labelAr?: string;
  weight: number;
  score: number;
  weightedScore: number;
}

export interface RubricEvaluationSnapshot {
  schemaVersion: number;
  sportId: string;
  overallScore: number;
  criteria: RubricCriterionSnapshot[];
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
  rubricScores?: RubricCriterionScorePayload[] | null;
}

export interface DecideTrialPayload {
  approved: boolean;
  waitlisted: boolean;
  adminDecisionNotes?: string | null;
}
