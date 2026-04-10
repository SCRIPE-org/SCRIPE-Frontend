import type { IMarketplaceRepository } from "../../domain/interfaces/IMarketplaceRepository";
import type { IMarketplaceService } from "../../domain/interfaces/IMarketplaceService";
import { MarketplaceMapper } from "../mappers/MarketplaceMapper";
import { MarketplaceEntity } from "../../domain/entities/MarketplaceEntity";

export class MarketplaceRepository implements IMarketplaceRepository {
  constructor(private readonly service: IMarketplaceService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: MarketplaceEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => MarketplaceMapper.toEntity(item as Parameters<typeof MarketplaceMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async install(pluginId: string): Promise<void> {
    await this.service.install(pluginId);
  }
}
