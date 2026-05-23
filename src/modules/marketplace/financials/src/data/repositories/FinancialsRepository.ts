/**
 * FinancialsRepository
 *
 * Bridges the service and domain layers:
 * 1. Delegates HTTP calls to FinancialsService (injected via IFinancialsService)
 * 2. Maps DTOs → AppPurchase / DeveloperPayout domain entities
 * 3. Returns typed domain entities to the presentation layer
 *
 * Architecture (H-02 refactor):
 *   ViewModel → FinancialsRepository (this) → IFinancialsService → IApiService → HTTP
 */
import type { IFinancialsService } from "../../domain/interfaces/IFinancialsService";
import { AppPurchase, DeveloperPayout } from "../../domain/entities/FinancialEntities";
import type { IFinancialsRepository } from "../../domain/interfaces/IFinancialsRepository";
import type { PurchaseDto, PayoutDto } from "../../domain/interfaces/IFinancialsService";

export class FinancialsRepository implements IFinancialsRepository {
  constructor(private readonly service: IFinancialsService) {}

  async getPurchases(params: { page: number; pageSize: number; tenantId?: string }) {
    const data = await this.service.getPurchases(params);
    return { ...data, items: (data.items ?? []).map(this.mapPurchase) };
  }

  async createPurchase(payload: { appListingId: string; tenantId: string }): Promise<string> {
    const r = await this.service.createPurchase(payload);
    return r.id;
  }

  async getPayouts(params: { developerProfileId: string; page: number; pageSize: number }) {
    const data = await this.service.getPayouts(params);
    return { ...data, items: (data.items ?? []).map(this.mapPayout) };
  }

  async processPayout(id: string, externalReference?: string): Promise<void> {
    await this.service.processPayout(id, externalReference);
  }

  private mapPurchase(d: PurchaseDto): AppPurchase {
    return new AppPurchase({
      id: d.id,
      appListingId: d.appListingId,
      appName: d.appName ?? "",
      tenantId: d.tenantId,
      tenantName: d.tenantName ?? "",
      amount: d.amount ?? 0,
      currency: d.currency ?? "USD",
      pricingModel: (d.pricingModel ?? "OneTime") as "OneTime" | "Subscription",
      purchasedAt: d.purchasedAt ?? new Date().toISOString(),
    });
  }

  private mapPayout(d: PayoutDto): DeveloperPayout {
    return new DeveloperPayout({
      id: d.id,
      developerProfileId: d.developerProfileId,
      developerName: d.developerName ?? "",
      amount: d.amount ?? 0,
      currency: d.currency ?? "USD",
      periodStart: d.periodStart ?? "",
      periodEnd: d.periodEnd ?? "",
      status: (d.status ?? "Pending") as "Pending" | "Processing" | "Paid" | "Failed",
      stripeTransferId: d.stripeTransferId ?? null,
      createdAt: d.createdAt ?? new Date().toISOString(),
    });
  }
}
