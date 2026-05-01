/**
 * Consent Service — HTTP calls only, no business logic.
 * Implements IConsentService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IConsentService } from "../../domain/interfaces/IConsentService";
import type { ConsentStatusModel } from "../models/ConsentModels";
import type { RecordConsentRequest } from "../../domain/entities/ConsentStatus";

export class ConsentService implements IConsentService {
  constructor(private readonly api: IApiService) {}

  getMyConsent(): Promise<ConsentStatusModel[]> {
    return this.api.get<ConsentStatusModel[]>(API_ENDPOINTS.COMPLIANCE.MY_CONSENT);
  }

  recordConsent(data: RecordConsentRequest): Promise<void> {
    return this.api.post<void>(API_ENDPOINTS.COMPLIANCE.RECORD_CONSENT, data);
  }

  withdrawConsent(purposeId: string): Promise<void> {
    return this.api.delete<void>(`${API_ENDPOINTS.COMPLIANCE.RECORD_CONSENT}/${purposeId}`);
  }
}
