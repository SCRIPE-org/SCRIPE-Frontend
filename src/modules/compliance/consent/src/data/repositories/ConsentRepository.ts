/**
 * Consent Repository — calls service, maps models → domain entities.
 * Implements IConsentRepository.
 */
import type { IConsentRepository } from "../../domain/interfaces/IConsentRepository";
import type { IConsentService } from "../../domain/interfaces/IConsentService";
import type { ConsentStatus } from "../../domain/entities/ConsentStatus";
import type { RecordConsentRequest } from "../../domain/entities/ConsentStatus";
import { ConsentMapper } from "../mappers/ConsentMapper";

export class ConsentRepository implements IConsentRepository {
  constructor(private readonly service: IConsentService) {}

  async getMyConsent(): Promise<ConsentStatus[]> {
    const models = await this.service.getMyConsent();
    return models.map(ConsentMapper.toEntity);
  }

  recordConsent(data: RecordConsentRequest): Promise<void> {
    return this.service.recordConsent(data);
  }

  withdrawConsent(purposeId: string): Promise<void> {
    return this.service.withdrawConsent(purposeId);
  }
}
