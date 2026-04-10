export interface IInvoicesService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
  getById(id: string): Promise<unknown>;
  pay(id: string): Promise<void>;
  void(id: string): Promise<void>;
  downloadPdf(id: string): Promise<Blob>;
}
