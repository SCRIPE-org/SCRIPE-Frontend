/**
 * Edition Repository Interface
 */
import type { Edition } from "../entities/Edition";
import type { EditionVersion } from "../entities/EditionVersion";
import type { EditionPriceItem, EditionPriceListResponse, SetEditionPricesRequest } from "../entities/EditionPricing";
import type { CreateEditionRequest, UpdateEditionRequest } from "../entities/EditionRequests";
import type { EditionPromotionData, CreatePromotionRequest, UpdatePromotionRequest, PromoCodeValidationResult } from "../entities/EditionPromotion";
import type { PagedResult, PaginationParams } from "@modules/system/core/domain/types";

export interface IEditionRepository {
      getAll(params: PaginationParams & { includeRetired?: boolean }): Promise<PagedResult<Edition>>;
      getById(id: string): Promise<Edition>;
      create(request: CreateEditionRequest): Promise<string>;
      update(id: string, request: UpdateEditionRequest): Promise<void>;
      delete(id: string): Promise<void>;
      setFeatureValue(editionId: string, featureId: string, value: string): Promise<void>;

      // ── Versioning ──
      getVersions(editionId: string): Promise<EditionVersion[]>;
      createVersion(editionId: string, changeNotes?: string, featureValues?: Record<string, string>, pricingSnapshot?: Array<{ currency: string; billingCycle: string; amount: number }>): Promise<string>;
      publishVersion(editionId: string, versionId: string, data: { rolloutStrategy: string; scheduledAt?: string; canaryPercentage?: number }): Promise<void>;
      cancelVersion(editionId: string, versionId: string): Promise<void>;

      // ── Direct Apply ──
      directApplyFeatures(editionId: string, featureValues: Record<string, string>): Promise<void>;

      // ── Pricing ──
      getEditionPrices(editionId: string): Promise<EditionPriceListResponse>;
      setEditionPrices(editionId: string, request: SetEditionPricesRequest): Promise<void>;
      getExchangeRates(baseCurrency?: string): Promise<Record<string, number>>;

      // ── Promotions ──
      getPromotions(editionId: string): Promise<EditionPromotionData[]>;
      createPromotion(editionId: string, data: CreatePromotionRequest): Promise<string>;
      updatePromotion(editionId: string, promoId: string, data: UpdatePromotionRequest): Promise<void>;
      deletePromotion(editionId: string, promoId: string): Promise<void>;
      validatePromoCode(editionId: string, promoCode: string): Promise<PromoCodeValidationResult>;
}

