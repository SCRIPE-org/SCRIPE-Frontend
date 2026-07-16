import type { ConsentStatusModel, ConsentAnalyticsModel } from "../../data/models/ConsentModels";
import type { RecordConsentRequest } from "../entities/ConsentStatus";

/**
 * Http API network service for i consent.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IConsentService {
  getMyConsent(): Promise<ConsentStatusModel[]>;
  recordConsent(data: RecordConsentRequest): Promise<void>;
  withdrawConsent(purposeId: string): Promise<void>;
  getAnalytics(): Promise<ConsentAnalyticsModel>;
}
