/**
 * IMarketplaceService Interface
 *
 * Defines the contract for Marketplace API operations.
 * Implemented by MarketplaceService in the data layer.
 */
import type { MarketplaceModel } from "../../data/models/MarketplaceModel";

export interface MarketplaceListResult {
  items: MarketplaceModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IMarketplaceService {
  getAll(params: { page: number; pageSize: number; search?: string }): Promise<MarketplaceListResult>;
  getById(id: string): Promise<MarketplaceModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
