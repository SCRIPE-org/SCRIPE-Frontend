import type { IProgramOfferingsRepository } from "../../domain/interfaces/IProgramOfferingsRepository";
import type { IProgramOfferingsService } from "../../domain/interfaces/IProgramOfferingsService";
import type { ProgramOffering, CreateOfferingPayload } from "../../domain/entities/ProgramOffering";

export class ProgramOfferingsRepository implements IProgramOfferingsRepository {
  constructor(private readonly service: IProgramOfferingsService) {}

  async fetchOfferings(branchId?: string, seasonId?: string, programId?: string): Promise<ProgramOffering[]> {
    return await this.service.getOfferings(branchId, seasonId, programId);
  }

  async createOffering(payload: CreateOfferingPayload): Promise<ProgramOffering> {
    return await this.service.createOffering(payload);
  }
}
