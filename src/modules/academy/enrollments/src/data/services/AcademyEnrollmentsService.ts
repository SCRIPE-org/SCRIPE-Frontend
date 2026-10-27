import type { IApiService } from "@core/interfaces/api.interface";
import type { IAcademyEnrollmentsService } from "../../domain/interfaces/IAcademyEnrollmentsService";
import type {
  AcademyEnrollment,
  CreateEnrollmentPayload,
  FinanceHandoffPayload
} from "../../domain/entities/AcademyEnrollment";
import { ACADEMY_ENROLLMENTS_ENDPOINTS } from "./academy-enrollments.endpoints";

export class AcademyEnrollmentsService implements IAcademyEnrollmentsService {
  constructor(private readonly api: IApiService) {}

  async getEnrollments(offeringId?: string, athleteId?: string, status?: string, billingStatus?: string): Promise<AcademyEnrollment[]> {
    const url = ACADEMY_ENROLLMENTS_ENDPOINTS.LIST(offeringId, athleteId, status, billingStatus);
    return await this.api.get<AcademyEnrollment[]>(url);
  }

  async getEnrollmentById(id: string): Promise<AcademyEnrollment> {
    const url = ACADEMY_ENROLLMENTS_ENDPOINTS.GET_BY_ID(id);
    return await this.api.get<AcademyEnrollment>(url);
  }

  async createEnrollment(payload: CreateEnrollmentPayload): Promise<AcademyEnrollment> {
    const url = ACADEMY_ENROLLMENTS_ENDPOINTS.CREATE();
    return await this.api.post<AcademyEnrollment>(url, payload);
  }

  async handoffToFinance(enrollmentId: string, payload?: FinanceHandoffPayload): Promise<AcademyEnrollment> {
    const url = ACADEMY_ENROLLMENTS_ENDPOINTS.FINANCE_HANDOFF(enrollmentId);
    return await this.api.post<AcademyEnrollment>(url, payload || {});
  }
}
