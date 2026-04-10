export interface IPluginsService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
  getById(id: string): Promise<unknown>;
  install(manifestJson: string, tenantId?: string): Promise<unknown>;
  enable(id: string): Promise<void>;
  disable(id: string): Promise<void>;
  getConfig(id: string): Promise<unknown>;
  updateConfig(id: string, config: Record<string, string>): Promise<void>;
  uninstall(id: string): Promise<void>;
}
