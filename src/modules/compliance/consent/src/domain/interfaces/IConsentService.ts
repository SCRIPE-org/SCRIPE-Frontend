import type { ConsentStatusModel, ConsentAnalyticsModel } from "../../data/models/ConsentModels";
import type { RecordConsentRequest } from "../entities/ConsentStatus";

/**
 * Interface defining operations for the Consent network service.
 */
export interface IConsentService {
  getMyConsent(): Promise<ConsentStatusModel[]>;
  recordConsent(data: RecordConsentRequest): Promise<void>;
  withdrawConsent(purposeId: string): Promise<void>;
  getAnalytics(): Promise<ConsentAnalyticsModel>;
}
