import type { IApiService } from "@core/interfaces/api.interface";
import type { IAcademyTrialsService } from "../../domain/interfaces/IAcademyTrialsService";
import type {
  AcademyTrial,
  RequestTrialPayload,
  SubmitEvaluationPayload,
  DecideTrialPayload
} from "../../domain/entities/AcademyTrial";
import { ACADEMY_TRIALS_ENDPOINTS } from "./academy-trials.endpoints";

export class AcademyTrialsService implements IAcademyTrialsService {
  constructor(private readonly api: IApiService) {}

  async getTrials(offeringId?: string, athleteId?: string, status?: string): Promise<AcademyTrial[]> {
    const url = ACADEMY_TRIALS_ENDPOINTS.LIST(offeringId, athleteId, status);
    return await this.api.get<AcademyTrial[]>(url);
  }

  async getTrialById(id: string): Promise<AcademyTrial> {
    const url = ACADEMY_TRIALS_ENDPOINTS.GET_BY_ID(id);
    return await this.api.get<AcademyTrial>(url);
  }

  async requestTrial(payload: RequestTrialPayload): Promise<AcademyTrial> {
    const url = ACADEMY_TRIALS_ENDPOINTS.CREATE();
    return await this.api.post<AcademyTrial>(url, payload);
  }

  async submitEvaluation(trialId: string, payload: SubmitEvaluationPayload): Promise<AcademyTrial> {
    const url = ACADEMY_TRIALS_ENDPOINTS.EVALUATE(trialId);
    return await this.api.post<AcademyTrial>(url, payload);
  }

  async decideTrial(trialId: string, payload: DecideTrialPayload): Promise<AcademyTrial> {
    const url = ACADEMY_TRIALS_ENDPOINTS.DECIDE(trialId);
    return await this.api.post<AcademyTrial>(url, payload);
  }
}
