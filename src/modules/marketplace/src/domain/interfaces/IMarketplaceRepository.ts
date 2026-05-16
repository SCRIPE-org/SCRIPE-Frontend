/**
 * IMarketplaceRepository Interface
 *
 * Defines the contract for Marketplace data access.
 * Works with domain entities, not DTOs.
 */
import type { Marketplace } from "../entities/Marketplace";

export interface MarketplaceListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IMarketplaceRepository {
  getAll(params: MarketplaceListParams): Promise<{ items: Marketplace[]; totalCount: number; page: number; pageSize: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean }>;
  getById(id: string): Promise<Marketplace>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
