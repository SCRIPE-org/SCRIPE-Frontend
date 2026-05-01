import type { ConsentStatusModel } from "../../data/models/ConsentModels";
import type { RecordConsentRequest } from "../entities/ConsentStatus";

export interface IConsentService {
  getMyConsent(): Promise<ConsentStatusModel[]>;
  recordConsent(data: RecordConsentRequest): Promise<void>;
  withdrawConsent(purposeId: string): Promise<void>;
}
