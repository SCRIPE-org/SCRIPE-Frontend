import type { IAcademyEnrollmentsRepository } from "../../domain/interfaces/IAcademyEnrollmentsRepository";
import type { IAcademyEnrollmentsService } from "../../domain/interfaces/IAcademyEnrollmentsService";
import type {
  AcademyEnrollment,
  CreateEnrollmentPayload,
  FinanceHandoffPayload
} from "../../domain/entities/AcademyEnrollment";

export class AcademyEnrollmentsRepository implements IAcademyEnrollmentsRepository {
  constructor(private readonly service: IAcademyEnrollmentsService) {}

  async getEnrollments(offeringId?: string, athleteId?: string, status?: string, billingStatus?: string): Promise<AcademyEnrollment[]> {
    return await this.service.getEnrollments(offeringId, athleteId, status, billingStatus);
  }

  async getEnrollmentById(id: string): Promise<AcademyEnrollment> {
    return await this.service.getEnrollmentById(id);
  }

  async createEnrollment(payload: CreateEnrollmentPayload): Promise<AcademyEnrollment> {
    return await this.service.createEnrollment(payload);
  }

  async handoffToFinance(enrollmentId: string, payload?: FinanceHandoffPayload): Promise<AcademyEnrollment> {
    return await this.service.handoffToFinance(enrollmentId, payload);
  }
}
