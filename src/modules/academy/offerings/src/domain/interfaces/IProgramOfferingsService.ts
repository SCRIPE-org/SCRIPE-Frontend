import type { ProgramOffering, CreateOfferingPayload } from "../entities/ProgramOffering";

export interface IProgramOfferingsService {
  getOfferings(branchId?: string, seasonId?: string, programId?: string): Promise<ProgramOffering[]>;
  createOffering(payload: CreateOfferingPayload): Promise<ProgramOffering>;
}
