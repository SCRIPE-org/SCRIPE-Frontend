import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IRegulationService } from "../../domain/interfaces/IRegulationService";
import type { RegulationProfileModel } from "../models/RegulationModels";

export class RegulationService implements IRegulationService {
  constructor(private readonly api: IApiService) {}

  getAll(): Promise<RegulationProfileModel[]> {
    return this.api.get<RegulationProfileModel[]>(API_ENDPOINTS.COMPLIANCE.REGULATIONS);
  }

  getById(id: string): Promise<RegulationProfileModel> {
    return this.api.get<RegulationProfileModel>(API_ENDPOINTS.COMPLIANCE.REGULATION_BY_ID(id));
  }
}
