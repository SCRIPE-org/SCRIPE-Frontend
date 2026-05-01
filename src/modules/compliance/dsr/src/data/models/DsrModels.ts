/**
 * DSR Data Models — Raw DTOs matching backend API response exactly.
 * NEVER used in presentation layer.
 */

export interface DsrModel {
  id: string;
  subjectEmail: string;
  subjectType: string;
  requestType: string;
  status: string;
  regulationCode: string;
  deadline: string;
  daysRemaining: number;
  slaPercent: number;
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
  reviewedBy?: string;
  notes?: string;
  resolution?: string;
}
