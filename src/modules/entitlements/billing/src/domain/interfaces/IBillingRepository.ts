import type { BillingEntity } from "../entities/BillingEntity";

export interface IBillingRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: BillingEntity[]; totalCount: number }>;
}
