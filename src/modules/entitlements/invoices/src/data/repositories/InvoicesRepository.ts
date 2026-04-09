import type { IInvoicesRepository } from "../../domain/interfaces/IInvoicesRepository";
import type { IInvoicesService } from "../../domain/interfaces/IInvoicesService";
import { InvoicesMapper } from "../mappers/InvoicesMapper";
import { InvoicesEntity } from "../../domain/entities/InvoicesEntity";

export class InvoicesRepository implements IInvoicesRepository {
  constructor(private readonly service: IInvoicesService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: InvoicesEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => InvoicesMapper.toEntity(item as Parameters<typeof InvoicesMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getById(id: string): Promise<InvoicesEntity> {
    const result = await this.service.getById(id);
    return InvoicesMapper.toEntity(result as Parameters<typeof InvoicesMapper.toEntity>[0]);
  }
}
