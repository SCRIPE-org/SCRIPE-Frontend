import type { 
  RegulationProfileModel, 
  CreateRegulationRequest, 
  UpdateRegulationRequest, 
  AddConsentPurposeRequest, 
  UpdateConsentPurposeRequest 
} from "../../data/models/RegulationModels";

export interface IRegulationService {
  getAll(): Promise<RegulationProfileModel[]>;
  getById(id: string): Promise<RegulationProfileModel>;
  create(data: CreateRegulationRequest): Promise<string>;
  update(id: string, data: UpdateRegulationRequest): Promise<void>;
  delete(id: string): Promise<void>;
  addPurpose(id: string, data: AddConsentPurposeRequest): Promise<string>;
  updatePurpose(id: string, purposeId: string, data: UpdateConsentPurposeRequest): Promise<void>;
  removePurpose(id: string, purposeId: string): Promise<void>;
}
