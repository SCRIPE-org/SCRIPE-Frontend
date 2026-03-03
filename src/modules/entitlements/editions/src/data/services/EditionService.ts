/**
 * Edition Service — API calls only
 *
 * Uses centralized API_ENDPOINTS for all endpoint paths.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { PagedResult, PaginationParams } from "@modules/system/core/domain/types";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

export interface EditionModel {
      id: string;
      name: string;
      displayNameEn: string;
      displayNameAr: string;
      description?: string;
      isSystem: boolean;
      isRetired: boolean;
      createdByTenantId?: string;
      featureCount?: number;
      features?: { featureId: string; featureName: string; value: string; valueType: string }[];
      fallbackEditionId?: string;
      fallbackEditionName?: string;
      overflowPolicy?: string;
      baseMonthlyPriceUsd?: number;
      createdAt: string;
      modifiedAt?: string;
}

export class EditionService {
      constructor(private readonly api: IApiService) { }

      async getAll(params: PaginationParams & { includeRetired?: boolean }): Promise<PagedResult<EditionModel>> {
            return this.api.get<PagedResult<EditionModel>>(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.LIST, {
                  page: params.page,
                  pageSize: params.pageSize,
                  search: params.search || undefined,
                  includeRetired: params.includeRetired,
            });
      }

      async getById(id: string): Promise<EditionModel> {
            return this.api.get<EditionModel>(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.BY_ID(id));
      }

      async create(data: Record<string, unknown>): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.CREATE, data);
      }

      async update(id: string, data: Record<string, unknown>): Promise<void> {
            await this.api.put(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.UPDATE(id), data);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.DELETE(id));
      }

      async setFeatureValue(editionId: string, featureId: string, value: string): Promise<void> {
            await this.api.put(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.SET_FEATURE(editionId, featureId), { value });
      }

      // ── Versioning ──
      async getVersions(editionId: string): Promise<EditionVersionModel[]> {
            return this.api.get<EditionVersionModel[]>(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.VERSIONS(editionId));
      }

      async createVersion(editionId: string, changeNotes?: string, featureValues?: Record<string, string>): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.CREATE_VERSION(editionId), { changeNotes, featureValues });
      }

      async publishVersion(editionId: string, versionId: string, data: { rolloutStrategy: string; scheduledAt?: string; canaryPercentage?: number }): Promise<void> {
            await this.api.post(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.PUBLISH_VERSION(editionId, versionId), data);
      }

      async cancelVersion(editionId: string, versionId: string): Promise<void> {
            await this.api.post(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.CANCEL_VERSION(editionId, versionId), {});
      }

      async directApplyFeatures(editionId: string, featureValues: Record<string, string>): Promise<void> {
            await this.api.post(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.DIRECT_APPLY_FEATURES(editionId), { featureValues });
      }

      // ── Pricing ──
      async getEditionPrices(editionId: string): Promise<{ editionId: string; prices: Array<{ currency: string; billingCycle: string; amount: number }> }> {
            return this.api.get(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.PRICES(editionId));
      }

      async setEditionPrices(editionId: string, prices: Array<{ currency: string; billingCycle: string; amount: number }>): Promise<void> {
            await this.api.put(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.SET_PRICES(editionId), { prices });
      }

      // ── Currency Exchange Rates ──
      async getExchangeRates(baseCurrency: string = "USD"): Promise<Record<string, number>> {
            return this.api.get<Record<string, number>>(API_ENDPOINTS.ENTITLEMENTS.CURRENCY.RATES(baseCurrency));
      }
}

export interface EditionVersionModel {
      id: string;
      versionNumber: number;
      changeNotes?: string;
      rolloutStrategy: string;
      status: string;
      scheduledAt?: string;
      completedAt?: string;
      canaryPercentage?: number;
      createdAt: string;
}
