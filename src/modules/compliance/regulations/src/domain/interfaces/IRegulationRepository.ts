import type { Regulation } from "../entities/Regulation";
import type {
  CreateRegulationRequest,
  UpdateRegulationRequest,
  AddConsentPurposeRequest,
  UpdateConsentPurposeRequest,
} from "../entities/Regulation";

/**
 * Repository layer implementing client request queries for i regulation.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
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
