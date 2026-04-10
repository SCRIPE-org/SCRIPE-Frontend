import type { InvoicesEntity } from "../entities/InvoicesEntity";

export interface IInvoicesRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: InvoicesEntity[]; totalCount: number }>;
  getById(id: string): Promise<InvoicesEntity>;
  pay(id: string): Promise<void>;
  void(id: string): Promise<void>;
  downloadPdf(id: string): Promise<Blob>;
}
