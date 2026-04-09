import type { MarketplaceEntity } from "../entities/MarketplaceEntity";

export interface IMarketplaceRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: MarketplaceEntity[]; totalCount: number }>;
}
