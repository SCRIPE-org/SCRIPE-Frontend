export interface IBillingService {
  getAll(params?: Record<string, unknown>): Promise<unknown>;
}
