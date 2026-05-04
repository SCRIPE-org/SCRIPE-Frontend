import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IRegulationService } from "../../domain/interfaces/IRegulationService";
import type { 
  RegulationProfileModel, 
  CreateRegulationRequest, 
  UpdateRegulationRequest, 
  AddConsentPurposeRequest, 
  UpdateConsentPurposeRequest 
} from "../models/RegulationModels";

export class RegulationService implements IRegulationService {
  constructor(private readonly api: IApiService) {}

  getAll(): Promise<RegulationProfileModel[]> {
    return this.api.get<RegulationProfileModel[]>(API_ENDPOINTS.COMPLIANCE.REGULATIONS);
  }

  getById(id: string): Promise<RegulationProfileModel> {
    return this.api.get<RegulationProfileModel>(API_ENDPOINTS.COMPLIANCE.REGULATION_BY_ID(id));
  }

  create(data: CreateRegulationRequest): Promise<string> {
    return this.api.post<string>(API_ENDPOINTS.COMPLIANCE.REGULATIONS, data);
  }

  update(id: string, data: UpdateRegulationRequest): Promise<void> {
    return this.api.put<void>(API_ENDPOINTS.COMPLIANCE.REGULATION_BY_ID(id), data);
  }

  delete(id: string): Promise<void> {
    return this.api.delete<void>(API_ENDPOINTS.COMPLIANCE.REGULATION_BY_ID(id));
  }

  addPurpose(id: string, data: AddConsentPurposeRequest): Promise<string> {
    return this.api.post<string>(API_ENDPOINTS.COMPLIANCE.REGULATION_PURPOSES(id), data);
  }

  updatePurpose(id: string, purposeId: string, data: UpdateConsentPurposeRequest): Promise<void> {
    return this.api.put<void>(API_ENDPOINTS.COMPLIANCE.REGULATION_PURPOSE_BY_ID(id, purposeId), data);
  }

  removePurpose(id: string, purposeId: string): Promise<void> {
    return this.api.delete<void>(API_ENDPOINTS.COMPLIANCE.REGULATION_PURPOSE_BY_ID(id, purposeId));
  }
}
