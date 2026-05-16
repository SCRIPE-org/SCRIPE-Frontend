/**
 * Marketplace Repository Implementation
 *
 * Implements IMarketplaceRepository using the MarketplaceService.
 * Uses MarketplaceMapper to convert between Models (DTOs) and Entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns Models
 * - Repository uses Mapper to convert to Entities
 * - ViewModel uses Repository, works with Entities
 */
import type { IMarketplaceRepository, MarketplaceListParams } from "../../domain/interfaces/IMarketplaceRepository";
import type { IMarketplaceService } from "../../domain/interfaces/IMarketplaceService";
import type { Marketplace } from "../../domain/entities/Marketplace";
import { MarketplaceMapper } from "../mappers/MarketplaceMapper";

export class MarketplaceRepository implements IMarketplaceRepository {
  constructor(private readonly service: IMarketplaceService) {}

  async getAll(params: MarketplaceListParams) {
    const result = await this.service.getAll(params);

    return {
      items: result.items.map((model) => MarketplaceMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<Marketplace> {
    const model = await this.service.getById(id);
    return MarketplaceMapper.toEntity(model);
  }

  async create(data: Record<string, unknown>): Promise<string> {
    const response = await this.service.create(data);
    return response.id;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.service.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }
}
