import type { IntegrationsEntity } from "../entities/IntegrationsEntity";

export interface IIntegrationsRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: IntegrationsEntity[]; totalCount: number }>;
  getById(id: string): Promise<IntegrationsEntity>;
  toggle(type: string, enabled: boolean): Promise<void>;
  testConnection(type: string): Promise<{ success: boolean; message: string }>;
}
