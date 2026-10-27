import type {
  AcademyEnrollment,
  CreateEnrollmentPayload,
  FinanceHandoffPayload
} from "../entities/AcademyEnrollment";

export interface IAcademyEnrollmentsRepository {
  getEnrollments(offeringId?: string, athleteId?: string, status?: string, billingStatus?: string): Promise<AcademyEnrollment[]>;
  getEnrollmentById(id: string): Promise<AcademyEnrollment>;
  createEnrollment(payload: CreateEnrollmentPayload): Promise<AcademyEnrollment>;
  handoffToFinance(enrollmentId: string, payload?: FinanceHandoffPayload): Promise<AcademyEnrollment>;
}
