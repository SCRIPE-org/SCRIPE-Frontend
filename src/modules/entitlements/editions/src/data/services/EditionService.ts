/**
 * Edition Service — API calls only
 *
 * Uses centralized API_ENDPOINTS for all endpoint paths.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IEditionService } from "../../domain/interfaces/IEditionService";
import type { EditionModel, EditionVersionModel } from "../models/EditionModels";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type {
  EditionPromotionData,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromoCodeValidationResult,
} from "../../domain/entities/EditionPromotion";
import type {
  CreateEditionRequest,
  UpdateEditionRequest,
} from "../../domain/entities/EditionRequests";

/**
 * API service for executing HTTP calls related to Edition endpoints.
 */
export class EditionService implements IEditionService {
  constructor(private readonly api: IApiService) {}

  async getAll(
    params: PaginationParams & { includeRetired?: boolean }
  ): Promise<PagedResult<EditionModel>> {
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

  async create(data: CreateEditionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.CREATE, data);
  }

  async update(id: string, data: UpdateEditionRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.DELETE(id));
  }

  async setFeatureValue(
    editionId: string,
    featureId: string,
    value: string,
    displayLabelEn?: string,
    displayLabelAr?: string,
    isHighlight?: boolean,
    highlightOrder?: number
  ): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.SET_FEATURE(editionId, featureId), {
      value,
      displayLabelEn: displayLabelEn || null,
      displayLabelAr: displayLabelAr || null,
      isHighlight: isHighlight ?? null,
      highlightOrder: highlightOrder ?? null,
    });
  }

  async removeFeature(editionId: string, featureId: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.REMOVE_FEATURE(editionId, featureId));
  }

  // ── Versioning ──
  async getVersions(editionId: string): Promise<EditionVersionModel[]> {
    return this.api.get<EditionVersionModel[]>(
      API_ENDPOINTS.ENTITLEMENTS.EDITIONS.VERSIONS(editionId)
    );
  }

  async createVersion(
    editionId: string,
    changeNotes?: string,
    featureValues?: Record<string, string>,
    pricingSnapshot?: Array<{ currency: string; billingCycle: string; amount: number }>,
    pendingLabels?: Record<string, { en?: string; ar?: string }>
  ): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      API_ENDPOINTS.ENTITLEMENTS.EDITIONS.CREATE_VERSION(editionId),
      { changeNotes, featureValues, pricingSnapshot, displayLabelOverrides: pendingLabels ?? {} }
    );
  }

  async publishVersion(
    editionId: string,
    versionId: string,
    data: { rolloutStrategy: string; scheduledAt?: string; canaryPercentage?: number }
  ): Promise<void> {
    await this.api.post(
      API_ENDPOINTS.ENTITLEMENTS.EDITIONS.PUBLISH_VERSION(editionId, versionId),
      data
    );
  }

  async cancelVersion(editionId: string, versionId: string): Promise<void> {
    await this.api.post(
      API_ENDPOINTS.ENTITLEMENTS.EDITIONS.CANCEL_VERSION(editionId, versionId),
      {}
    );
  }

  async directApplyFeatures(
    editionId: string,
    featureValues: Record<string, string>,
    changedLabels?: Record<string, { en?: string; ar?: string }>
  ): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.DIRECT_APPLY_FEATURES(editionId), {
      featureValues,
      displayLabelOverrides: changedLabels ?? {},
    });
  }

  // ── Pricing ──
  async getEditionPrices(editionId: string): Promise<{
    editionId: string;
    prices: Array<{ currency: string; billingCycle: string; amount: number }>;
  }> {
    return this.api.get(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.PRICES(editionId));
  }

  async setEditionPrices(
    editionId: string,
    prices: Array<{ currency: string; billingCycle: string; amount: number }>
  ): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.SET_PRICES(editionId), { prices });
  }

  // ── Currency Exchange Rates ──
  async getExchangeRates(baseCurrency: string = "USD"): Promise<Record<string, number>> {
    return this.api.get<Record<string, number>>(
      API_ENDPOINTS.ENTITLEMENTS.CURRENCY.RATES(baseCurrency)
    );
  }

  // ── Promotions ──
  async getPromotions(editionId: string): Promise<EditionPromotionData[]> {
    return this.api.get<EditionPromotionData[]>(
      API_ENDPOINTS.ENTITLEMENTS.EDITIONS.PROMOTIONS(editionId)
    );
  }

  async createPromotion(editionId: string, data: CreatePromotionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      API_ENDPOINTS.ENTITLEMENTS.EDITIONS.CREATE_PROMOTION(editionId),
      data
    );
  }

  async updatePromotion(
    editionId: string,
    promoId: string,
    data: UpdatePromotionRequest
  ): Promise<void> {
    await this.api.put(
      API_ENDPOINTS.ENTITLEMENTS.EDITIONS.UPDATE_PROMOTION(editionId, promoId),
      data
    );
  }

  async deletePromotion(editionId: string, promoId: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.DELETE_PROMOTION(editionId, promoId));
  }

  async validatePromoCode(
    editionId: string,
    promoCode: string
  ): Promise<PromoCodeValidationResult> {
    return this.api.post<PromoCodeValidationResult>(
      API_ENDPOINTS.ENTITLEMENTS.EDITIONS.VALIDATE_PROMO_CODE(editionId),
      { promoCode }
    );
  }
}
