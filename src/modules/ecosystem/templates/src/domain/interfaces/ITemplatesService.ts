export interface ITemplatesService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
  getById(id: string): Promise<unknown>;
  create(data: Record<string, unknown>): Promise<unknown>;
  update(id: string, data: Record<string, unknown>): Promise<unknown>;
  delete(id: string): Promise<void>;
  apply(id: string): Promise<void>;
}
