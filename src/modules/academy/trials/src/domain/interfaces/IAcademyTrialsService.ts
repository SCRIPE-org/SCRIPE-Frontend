import type {
  AcademyTrial,
  RequestTrialPayload,
  SubmitEvaluationPayload,
  DecideTrialPayload
} from "../entities/AcademyTrial";

export interface IAcademyTrialsService {
  getTrials(offeringId?: string, athleteId?: string, status?: string): Promise<AcademyTrial[]>;
  getTrialById(id: string): Promise<AcademyTrial>;
  requestTrial(payload: RequestTrialPayload): Promise<AcademyTrial>;
  submitEvaluation(trialId: string, payload: SubmitEvaluationPayload): Promise<AcademyTrial>;
  decideTrial(trialId: string, payload: DecideTrialPayload): Promise<AcademyTrial>;
}
