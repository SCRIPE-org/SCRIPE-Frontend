"use client";

import type { IApiService } from "@core/interfaces/api.interface";
import { MARKETPLACE_ENDPOINTS } from "@core/config/api-endpoints";
import { AppPurchase, DeveloperPayout } from "../../domain/entities/FinancialEntities";
import type { IFinancialsRepository } from "../../domain/interfaces/IFinancialsRepository";

export class FinancialsRepository implements IFinancialsRepository {
  constructor(private readonly api: IApiService) {}

  async getPurchases(params: { page: number; pageSize: number; tenantId?: string }) {
    const q = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize), ...(params.tenantId && { tenantId: params.tenantId }) });
    const data = await this.api.get<any>(`${MARKETPLACE_ENDPOINTS.MARKETPLACE.PURCHASES}?${q}`);
    return { ...data, items: (data.items ?? []).map(this.mapPurchase) };
  }

  async createPurchase(payload: { appListingId: string; tenantId: string }): Promise<string> {
    const r = await this.api.post<{ id: string }>(MARKETPLACE_ENDPOINTS.MARKETPLACE.PURCHASES, payload);
    return r.id;
  }

  async getPayouts(params: { developerProfileId: string; page: number; pageSize: number }) {
    const q = new URLSearchParams({ developerProfileId: params.developerProfileId, page: String(params.page), pageSize: String(params.pageSize) });
    const data = await this.api.get<any>(`${MARKETPLACE_ENDPOINTS.MARKETPLACE.PAYOUTS}?${q}`);
    return { ...data, items: (data.items ?? []).map(this.mapPayout) };
  }

  async processPayout(id: string, externalReference?: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.PAYOUT_PROCESS(id), { externalReference: externalReference ?? null });
  }

  private mapPurchase(d: any): AppPurchase {
    return new AppPurchase({
      id: d.id, appListingId: d.appListingId, appName: d.appName ?? "",
      tenantId: d.tenantId, tenantName: d.tenantName ?? "",
      amount: d.amount ?? 0, currency: d.currency ?? "USD",
      pricingModel: d.pricingModel ?? "OneTime",
      purchasedAt: d.purchasedAt ?? new Date().toISOString(),
    });
  }

  private mapPayout(d: any): DeveloperPayout {
    return new DeveloperPayout({
      id: d.id, developerProfileId: d.developerProfileId, developerName: d.developerName ?? "",
      amount: d.amount ?? 0, currency: d.currency ?? "USD",
      periodStart: d.periodStart ?? "", periodEnd: d.periodEnd ?? "",
      status: d.status ?? "Pending", stripeTransferId: d.stripeTransferId ?? null,
      createdAt: d.createdAt ?? new Date().toISOString(),
    });
  }
}
