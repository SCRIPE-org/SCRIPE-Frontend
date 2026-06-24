import type {
  IDefinitionsRepository,
  CreateDefinitionRequest,
  UpdateDefinitionRequest,
} from "../../domain/interfaces/IDefinitionsRepository";
import type { IDefinitionsService } from "../../domain/interfaces/IDefinitionsService";
import { DefinitionsMapper } from "../mappers/DefinitionsMapper";
import type { PluginDefinition } from "@modules/plugins/core";

/**
 * Repository implementation for managing database operations on Definitions resources.
 */
export class DefinitionsRepository implements IDefinitionsRepository {
  constructor(private readonly service: IDefinitionsService) {}

  async getAll(): Promise<PluginDefinition[]> {
    const models = await this.service.getAll();
    return DefinitionsMapper.toEntityList(models);
  }

  async getById(id: string): Promise<PluginDefinition> {
    const model = await this.service.getById(id);
    return DefinitionsMapper.toEntity(model);
  }

  async create(request: CreateDefinitionRequest): Promise<string> {
    return this.service.create(request);
  }

  async update(request: UpdateDefinitionRequest): Promise<void> {
    return this.service.update(request);
  }

  async delete(id: string): Promise<void> {
    return this.service.delete(id);
  }

  async publish(id: string): Promise<void> {
    return this.service.publish(id);
  }

  async deprecate(id: string): Promise<void> {
    return this.service.deprecate(id);
  }
}
