import type { ProgramOffering, CreateOfferingPayload } from "../entities/ProgramOffering";

export interface IProgramOfferingsRepository {
  fetchOfferings(branchId?: string, seasonId?: string, programId?: string): Promise<ProgramOffering[]>;
  createOffering(payload: CreateOfferingPayload): Promise<ProgramOffering>;
}
