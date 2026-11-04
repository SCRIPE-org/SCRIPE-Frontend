import type { IApiService } from "@core/interfaces/api.interface";
import type { IProgramOfferingsService } from "../../domain/interfaces/IProgramOfferingsService";
import type { ProgramOffering, CreateOfferingPayload } from "../../domain/entities/ProgramOffering";
import { PROGRAM_OFFERINGS_ENDPOINTS } from "./program-offerings.endpoints";

export class ProgramOfferingsService implements IProgramOfferingsService {
  constructor(private readonly api: IApiService) {}

  async getOfferings(branchId?: string, seasonId?: string, programId?: string): Promise<ProgramOffering[]> {
    const url = PROGRAM_OFFERINGS_ENDPOINTS.LIST(branchId, seasonId, programId);
    return await this.api.get<ProgramOffering[]>(url);
  }

  async createOffering(payload: CreateOfferingPayload): Promise<ProgramOffering> {
    const url = PROGRAM_OFFERINGS_ENDPOINTS.CREATE();
    return await this.api.post<ProgramOffering>(url, payload);
  }
}
