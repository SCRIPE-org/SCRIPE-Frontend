import type { ConsentStatus, ConsentAnalytics } from "../entities/ConsentStatus";
import type { RecordConsentRequest } from "../entities/ConsentStatus";

/**
 * Repository layer implementing client request queries for i consent.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IConsentRepository {
  getMyConsent(): Promise<ConsentStatus[]>;
  recordConsent(data: RecordConsentRequest): Promise<void>;
  withdrawConsent(purposeId: string): Promise<void>;
  getAnalytics(): Promise<ConsentAnalytics>;
}
