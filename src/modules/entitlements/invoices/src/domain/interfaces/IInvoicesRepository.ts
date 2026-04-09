import type { InvoicesEntity } from "../entities/InvoicesEntity";

export interface IInvoicesRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: InvoicesEntity[]; totalCount: number }>;
  getById(id: string): Promise<InvoicesEntity>;
}
