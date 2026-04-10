export interface IMarketplaceService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
  install(pluginId: string): Promise<void>;
}
