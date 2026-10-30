import type { IAcademyTrialsRepository } from "../../domain/interfaces/IAcademyTrialsRepository";
import type { IAcademyTrialsService } from "../../domain/interfaces/IAcademyTrialsService";
import type {
  AcademyTrial,
  RequestTrialPayload,
  SubmitEvaluationPayload,
  DecideTrialPayload
} from "../../domain/entities/AcademyTrial";

export class AcademyTrialsRepository implements IAcademyTrialsRepository {
  constructor(private readonly service: IAcademyTrialsService) {}

  async getTrials(offeringId?: string, athleteId?: string, status?: string): Promise<AcademyTrial[]> {
    return await this.service.getTrials(offeringId, athleteId, status);
  }

  async getTrialById(id: string): Promise<AcademyTrial> {
    return await this.service.getTrialById(id);
  }

  async requestTrial(payload: RequestTrialPayload): Promise<AcademyTrial> {
    return await this.service.requestTrial(payload);
  }

  async submitEvaluation(trialId: string, payload: SubmitEvaluationPayload): Promise<AcademyTrial> {
    return await this.service.submitEvaluation(trialId, payload);
  }

  async decideTrial(trialId: string, payload: DecideTrialPayload): Promise<AcademyTrial> {
    return await this.service.decideTrial(trialId, payload);
  }
}
