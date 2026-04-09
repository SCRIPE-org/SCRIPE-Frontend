import type { IBillingRepository } from "../../domain/interfaces/IBillingRepository";
import type { IBillingService } from "../../domain/interfaces/IBillingService";
import { BillingMapper } from "../mappers/BillingMapper";
import { BillingEntity } from "../../domain/entities/BillingEntity";

export class BillingRepository implements IBillingRepository {
  constructor(private readonly service: IBillingService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: BillingEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => BillingMapper.toEntity(item as Parameters<typeof BillingMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }
}
