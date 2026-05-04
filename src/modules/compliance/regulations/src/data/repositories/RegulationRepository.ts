import type { IRegulationRepository } from "../../domain/interfaces/IRegulationRepository";
import type { IRegulationService } from "../../domain/interfaces/IRegulationService";
import type { Regulation } from "../../domain/entities/Regulation";
import { RegulationMapper } from "../mappers/RegulationMapper";

export class RegulationRepository implements IRegulationRepository {
  constructor(private readonly service: IRegulationService) {}

  async getAll(): Promise<Regulation[]> {
    const models = await this.service.getAll();
    return models.map(RegulationMapper.toEntity);
  }

  async getById(id: string): Promise<Regulation> {
    const model = await this.service.getById(id);
    return RegulationMapper.toEntity(model);
  }

  create(data: import("../../data/models/RegulationModels").CreateRegulationRequest): Promise<string> {
    return this.service.create(data);
  }

  update(id: string, data: import("../../data/models/RegulationModels").UpdateRegulationRequest): Promise<void> {
    return this.service.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.service.delete(id);
  }

  addPurpose(id: string, data: import("../../data/models/RegulationModels").AddConsentPurposeRequest): Promise<string> {
    return this.service.addPurpose(id, data);
  }

  updatePurpose(id: string, purposeId: string, data: import("../../data/models/RegulationModels").UpdateConsentPurposeRequest): Promise<void> {
    return this.service.updatePurpose(id, purposeId, data);
  }

  removePurpose(id: string, purposeId: string): Promise<void> {
    return this.service.removePurpose(id, purposeId);
  }
}
