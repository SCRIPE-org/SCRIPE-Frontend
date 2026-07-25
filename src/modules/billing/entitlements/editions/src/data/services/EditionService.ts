/**
 * Edition Service — API calls only
 *
 * Uses local EDITIONS_ENDPOINTS for all endpoint paths.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IEditionService } from "../../domain/interfaces/IEditionService";
import type { EditionModel, EditionVersionModel } from "../models/EditionModels";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";
import { EDITIONS_ENDPOINTS } from "./editions.endpoints";
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
 * Http API network service for edition.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class EditionService implements IEditionService {
  constructor(private readonly api: IApiService) {}

  async getAll(
    params: PaginationParams & { includeRetired?: boolean }
  ): Promise<PagedResult<EditionModel>> {
    return this.api.get<PagedResult<EditionModel>>(EDITIONS_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
      includeRetired: params.includeRetired,
    });
  }

  async getById(id: string): Promise<EditionModel> {
    return this.api.get<EditionModel>(EDITIONS_ENDPOINTS.BY_ID(id));
  }

  async create(data: CreateEditionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(EDITIONS_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: UpdateEditionRequest): Promise<void> {
    await this.api.put(EDITIONS_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(EDITIONS_ENDPOINTS.DELETE(id));
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
    await this.api.put(EDITIONS_ENDPOINTS.SET_FEATURE(editionId, featureId), {
      value,
      displayLabelEn: displayLabelEn || null,
      displayLabelAr: displayLabelAr || null,
      isHighlight: isHighlight ?? null,
      highlightOrder: highlightOrder ?? null,
    });
  }

  async removeFeature(editionId: string, featureId: string): Promise<void> {
    await this.api.delete(EDITIONS_ENDPOINTS.REMOVE_FEATURE(editionId, featureId));
  }

  // ── Versioning ──
  async getVersions(editionId: string): Promise<EditionVersionModel[]> {
    return this.api.get<EditionVersionModel[]>(EDITIONS_ENDPOINTS.VERSIONS(editionId));
  }

  async createVersion(
    editionId: string,
    changeNotes?: string,
    featureValues?: Record<string, string>,
    pricingSnapshot?: Array<{ currency: string; billingCycle: string; amount: number }>,
    pendingLabels?: Record<string, { en?: string; ar?: string }>
  ): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(EDITIONS_ENDPOINTS.CREATE_VERSION(editionId), {
      changeNotes,
      featureValues,
      pricingSnapshot,
      displayLabelOverrides: pendingLabels ?? {},
    });
  }

  async publishVersion(
    editionId: string,
    versionId: string,
    data: { rolloutStrategy: string; scheduledAt?: string; canaryPercentage?: number }
  ): Promise<void> {
    await this.api.post(EDITIONS_ENDPOINTS.PUBLISH_VERSION(editionId, versionId), data);
  }

  async cancelVersion(editionId: string, versionId: string): Promise<void> {
    await this.api.post(EDITIONS_ENDPOINTS.CANCEL_VERSION(editionId, versionId), {});
  }

  async directApplyFeatures(
    editionId: string,
    featureValues: Record<string, string>,
    changedLabels?: Record<string, { en?: string; ar?: string }>
  ): Promise<void> {
    await this.api.post(EDITIONS_ENDPOINTS.DIRECT_APPLY_FEATURES(editionId), {
      featureValues,
      displayLabelOverrides: changedLabels ?? {},
    });
  }

  // ── Pricing ──
  async getEditionPrices(editionId: string): Promise<{
    editionId: string;
    prices: Array<{ currency: string; billingCycle: string; amount: number }>;
  }> {
    return this.api.get(EDITIONS_ENDPOINTS.PRICES(editionId));
  }

  async setEditionPrices(
    editionId: string,
    prices: Array<{ currency: string; billingCycle: string; amount: number }>
  ): Promise<void> {
    await this.api.put(EDITIONS_ENDPOINTS.SET_PRICES(editionId), { prices });
  }

  // ── Currency Exchange Rates ──
  async getExchangeRates(baseCurrency: string = "USD"): Promise<Record<string, number>> {
    return this.api.get<Record<string, number>>(EDITIONS_ENDPOINTS.RATES(baseCurrency));
  }

  // ── Promotions ──
  async getPromotions(editionId: string): Promise<EditionPromotionData[]> {
    return this.api.get<EditionPromotionData[]>(EDITIONS_ENDPOINTS.PROMOTIONS(editionId));
  }

  async createPromotion(editionId: string, data: CreatePromotionRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(EDITIONS_ENDPOINTS.CREATE_PROMOTION(editionId), data);
  }

  async updatePromotion(
    editionId: string,
    promoId: string,
    data: UpdatePromotionRequest
  ): Promise<void> {
    await this.api.put(EDITIONS_ENDPOINTS.UPDATE_PROMOTION(editionId, promoId), data);
  }

  async deletePromotion(editionId: string, promoId: string): Promise<void> {
    await this.api.delete(EDITIONS_ENDPOINTS.DELETE_PROMOTION(editionId, promoId));
  }

  async validatePromoCode(
    editionId: string,
    promoCode: string
  ): Promise<PromoCodeValidationResult> {
    return this.api.post<PromoCodeValidationResult>(
      EDITIONS_ENDPOINTS.VALIDATE_PROMO_CODE(editionId),
      { promoCode }
    );
  }
}
