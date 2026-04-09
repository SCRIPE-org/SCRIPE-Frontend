export interface IDeveloperService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
}
