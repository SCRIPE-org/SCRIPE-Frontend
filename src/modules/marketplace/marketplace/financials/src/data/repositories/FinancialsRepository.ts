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
import type { IFinancialsRepository } from "../../domain/interfaces/IFinancialsRepository";
import { FinancialMapper } from "../mappers/FinancialMapper";

/**
 * Repository layer implementing client request queries for financials.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class FinancialsRepository implements IFinancialsRepository {
  constructor(private readonly service: IFinancialsService) {}

  async getPurchases(params: { page: number; pageSize: number; tenantId?: string }) {
    const data = await this.service.getPurchases(params);
    return { ...data, items: (data.items ?? []).map(FinancialMapper.toPurchase) };
  }

  async createPurchase(payload: { appListingId: string; tenantId: string }): Promise<string> {
    const r = await this.service.createPurchase(payload);
    return r.id;
  }

  async getPayouts(params: { developerProfileId: string; page: number; pageSize: number }) {
    const data = await this.service.getPayouts(params);
    return { ...data, items: (data.items ?? []).map(FinancialMapper.toPayout) };
  }

  async processPayout(id: string, externalReference?: string): Promise<void> {
    await this.service.processPayout(id, externalReference);
  }
}
