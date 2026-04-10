export interface IIntegrationsService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
  getById(id: string): Promise<unknown>;
  toggle(type: string, enabled: boolean): Promise<void>;
  testConnection(type: string): Promise<{ success: boolean; message: string }>;
}
