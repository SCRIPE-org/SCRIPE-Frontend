import type { ICatalogRepository } from "../../domain/interfaces/ICatalogRepository";
import type { ICatalogService } from "../../domain/interfaces/ICatalogService";
import type { PluginCatalogItem } from "../../domain/entities/PluginCatalogItem";
import { CatalogMapper } from "../mappers/CatalogMapper";
import type { InstallPluginRequest } from "../models/CatalogModels";

/**
 * Repository implementation for managing database operations on Catalog resources.
 */
export class CatalogRepository implements ICatalogRepository {
  constructor(private readonly service: ICatalogService) {}

  async getCatalog(tenantId: string): Promise<PluginCatalogItem[]> {
    const models = await this.service.getCatalog(tenantId);
    return models.map(CatalogMapper.toEntity);
  }

  install(request: InstallPluginRequest): Promise<string> {
    return this.service.install(request);
  }
}
