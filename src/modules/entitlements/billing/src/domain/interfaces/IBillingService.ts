export interface IBillingService {
  getConfig(tenantId: string): Promise<unknown>;
  getRevenue(from?: string, to?: string): Promise<unknown>;
  getFeatures(moduleName?: string): Promise<unknown>;
  updateMode(tenantId: string, paymentMode: string): Promise<unknown>;
  startOnboarding(tenantId: string, data: Record<string, string>): Promise<unknown>;
}
