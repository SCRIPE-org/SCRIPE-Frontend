import type { ConsentStatus, ConsentAnalytics } from "../entities/ConsentStatus";
import type { RecordConsentRequest } from "../entities/ConsentStatus";

export interface IConsentRepository {
  getMyConsent(): Promise<ConsentStatus[]>;
  recordConsent(data: RecordConsentRequest): Promise<void>;
  withdrawConsent(purposeId: string): Promise<void>;
  getAnalytics(): Promise<ConsentAnalytics>;
}
