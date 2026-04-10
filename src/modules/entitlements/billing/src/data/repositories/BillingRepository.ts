import type { IBillingRepository } from "../../domain/interfaces/IBillingRepository";
import type { IBillingService } from "../../domain/interfaces/IBillingService";

export class BillingRepository implements IBillingRepository {
  constructor(private readonly service: IBillingService) {}

  async getConfig(tenantId: string): Promise<unknown> {
    return this.service.getConfig(tenantId);
  }

  async getRevenue(from?: string, to?: string): Promise<unknown> {
    return this.service.getRevenue(from, to);
  }

  async getFeatures(moduleName?: string): Promise<unknown> {
    return this.service.getFeatures(moduleName);
  }

  async updateMode(tenantId: string, paymentMode: string): Promise<unknown> {
    return this.service.updateMode(tenantId, paymentMode);
  }

  async startOnboarding(tenantId: string, data: Record<string, string>): Promise<unknown> {
    return this.service.startOnboarding(tenantId, data);
  }
}
