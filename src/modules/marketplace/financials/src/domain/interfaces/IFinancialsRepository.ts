import type { AppPurchase, DeveloperPayout } from "../entities/FinancialEntities";

export interface IFinancialsRepository {
  getPurchases(params: { page: number; pageSize: number; tenantId?: string }): Promise<{ items: AppPurchase[]; totalCount: number; totalPages: number; page: number; pageSize: number; hasNextPage: boolean; hasPreviousPage: boolean }>;
  createPurchase(data: { appListingId: string; tenantId: string }): Promise<string>;
  getPayouts(params: { developerProfileId: string; page: number; pageSize: number }): Promise<{ items: DeveloperPayout[]; totalCount: number; totalPages: number; page: number; pageSize: number; hasNextPage: boolean; hasPreviousPage: boolean }>;
  processPayout(id: string, externalReference?: string): Promise<void>;
}
