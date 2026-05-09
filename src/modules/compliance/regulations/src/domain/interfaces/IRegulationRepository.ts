import type { Regulation } from "../entities/Regulation";
import type {
  CreateRegulationRequest,
  UpdateRegulationRequest,
  AddConsentPurposeRequest,
  UpdateConsentPurposeRequest,
} from "../../data/models/RegulationModels";

export interface IRegulationRepository {
  getAll(): Promise<Regulation[]>;
  getById(id: string): Promise<Regulation>;
  create(data: CreateRegulationRequest): Promise<string>;
  update(id: string, data: UpdateRegulationRequest): Promise<void>;
  delete(id: string): Promise<void>;
  addPurpose(id: string, data: AddConsentPurposeRequest): Promise<string>;
  updatePurpose(id: string, purposeId: string, data: UpdateConsentPurposeRequest): Promise<void>;
  removePurpose(id: string, purposeId: string): Promise<void>;
}
