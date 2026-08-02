import type { IApiService } from "@core/interfaces/api.interface";
import type { IRegulationService } from "../../domain/interfaces/IRegulationService";
import type {
  RegulationProfileModel,
  CreateRegulationRequest,
  UpdateRegulationRequest,
  AddConsentPurposeRequest,
  UpdateConsentPurposeRequest,
} from "../models/RegulationModels";
import { REGULATIONS_ENDPOINTS } from "./regulations.endpoints";

/**
 * Http API network service for regulation.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class RegulationService implements IRegulationService {
  constructor(private readonly api: IApiService) {}

  getAll(): Promise<RegulationProfileModel[]> {
    return this.api.get<RegulationProfileModel[]>(REGULATIONS_ENDPOINTS.REGULATIONS);
  }

  getById(id: string): Promise<RegulationProfileModel> {
    return this.api.get<RegulationProfileModel>(REGULATIONS_ENDPOINTS.REGULATION_BY_ID(id));
  }

  create(data: CreateRegulationRequest): Promise<string> {
    return this.api.post<string>(REGULATIONS_ENDPOINTS.REGULATIONS, data);
  }

  update(id: string, data: UpdateRegulationRequest): Promise<void> {
    return this.api.put<void>(REGULATIONS_ENDPOINTS.REGULATION_BY_ID(id), data);
  }

  delete(id: string): Promise<void> {
    return this.api.delete<void>(REGULATIONS_ENDPOINTS.REGULATION_BY_ID(id));
  }

  addPurpose(id: string, data: AddConsentPurposeRequest): Promise<string> {
    return this.api.post<string>(REGULATIONS_ENDPOINTS.REGULATION_PURPOSES(id), data);
  }

  updatePurpose(id: string, purposeId: string, data: UpdateConsentPurposeRequest): Promise<void> {
    return this.api.put<void>(REGULATIONS_ENDPOINTS.REGULATION_PURPOSE_BY_ID(id, purposeId), data);
  }

  removePurpose(id: string, purposeId: string): Promise<void> {
    return this.api.delete<void>(REGULATIONS_ENDPOINTS.REGULATION_PURPOSE_BY_ID(id, purposeId));
  }
}
