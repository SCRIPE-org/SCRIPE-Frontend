import type { RegulationProfileModel } from "../../data/models/RegulationModels";

export interface IRegulationService {
  getAll(): Promise<RegulationProfileModel[]>;
  getById(id: string): Promise<RegulationProfileModel>;
}
