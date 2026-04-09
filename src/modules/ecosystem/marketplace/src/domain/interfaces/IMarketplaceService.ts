export interface IMarketplaceService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
}
