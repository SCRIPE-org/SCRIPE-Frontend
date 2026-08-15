/**
 * Consent Service — HTTP calls only, no business logic.
 * Implements IConsentService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IConsentService } from "../../domain/interfaces/IConsentService";
import type { ConsentStatusModel, ConsentAnalyticsModel } from "../models/ConsentModels";
import type { RecordConsentRequest } from "../../domain/entities/ConsentStatus";
import { CONSENT_ENDPOINTS } from "./consent.endpoints";

/**
 * Http API network service for consent.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class ConsentService implements IConsentService {
  constructor(private readonly api: IApiService) {}

  getMyConsent(): Promise<ConsentStatusModel[]> {
    return this.api.get<ConsentStatusModel[]>(CONSENT_ENDPOINTS.MY_CONSENT);
  }

  recordConsent(data: RecordConsentRequest): Promise<void> {
    return this.api.post<void>(CONSENT_ENDPOINTS.RECORD_CONSENT, data);
  }

  withdrawConsent(purposeId: string): Promise<void> {
    return this.api.delete<void>(`${CONSENT_ENDPOINTS.RECORD_CONSENT}/${purposeId}`);
  }

  getAnalytics(): Promise<ConsentAnalyticsModel> {
    return this.api.get<ConsentAnalyticsModel>(CONSENT_ENDPOINTS.CONSENT_ANALYTICS);
  }
}
