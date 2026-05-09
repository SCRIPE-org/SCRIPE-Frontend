/**
 * Edition Service Interface (API contract)
 *
 * Defines the contract for edition API operations.
 * Implemented by EditionService in the data layer.
 */
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import type { EditionModel, EditionVersionModel } from "../../data/models/EditionModels";
import type {
  EditionPromotionData,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromoCodeValidationResult,
} from "../entities/EditionPromotion";
import type { CreateEditionRequest, UpdateEditionRequest } from "../entities/EditionRequests";

export interface IEditionService {
  getAll(
    params: PaginationParams & { includeRetired?: boolean }
  ): Promise<PagedResult<EditionModel>>;
  getById(id: string): Promise<EditionModel>;
  create(data: CreateEditionRequest): Promise<{ id: string }>;
  update(id: string, data: UpdateEditionRequest): Promise<void>;
  delete(id: string): Promise<void>;
  setFeatureValue(editionId: string, featureId: string, value: string): Promise<void>;

  // ── Versioning ──
  getVersions(editionId: string): Promise<EditionVersionModel[]>;
  createVersion(
    editionId: string,
    changeNotes?: string,
    featureValues?: Record<string, string>,
    pricingSnapshot?: Array<{ currency: string; billingCycle: string; amount: number }>
  ): Promise<{ id: string }>;
  publishVersion(
    editionId: string,
    versionId: string,
    data: { rolloutStrategy: string; scheduledAt?: string; canaryPercentage?: number }
  ): Promise<void>;
  cancelVersion(editionId: string, versionId: string): Promise<void>;

  // ── Direct Apply ──
  directApplyFeatures(editionId: string, featureValues: Record<string, string>): Promise<void>;

  // ── Pricing ──
  getEditionPrices(editionId: string): Promise<{
    editionId: string;
    prices: Array<{ currency: string; billingCycle: string; amount: number }>;
  }>;
  setEditionPrices(
    editionId: string,
    prices: Array<{ currency: string; billingCycle: string; amount: number }>
  ): Promise<void>;
  getExchangeRates(baseCurrency?: string): Promise<Record<string, number>>;

  // ── Promotions ──
  getPromotions(editionId: string): Promise<EditionPromotionData[]>;
  createPromotion(editionId: string, data: CreatePromotionRequest): Promise<{ id: string }>;
  updatePromotion(editionId: string, promoId: string, data: UpdatePromotionRequest): Promise<void>;
  deletePromotion(editionId: string, promoId: string): Promise<void>;
  validatePromoCode(editionId: string, promoCode: string): Promise<PromoCodeValidationResult>;
}
