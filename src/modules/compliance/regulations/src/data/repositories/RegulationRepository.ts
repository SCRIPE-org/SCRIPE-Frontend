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
}
