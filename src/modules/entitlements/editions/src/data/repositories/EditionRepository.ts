/**
 * Edition Repository — uses Service + Mapper
 */
import type { IEditionRepository } from "../../domain/interfaces/IEditionRepository";
import { Edition } from "../../domain/entities/Edition";
import type { EditionVersion } from "../../domain/entities/EditionVersion";
import type {
  EditionPriceListResponse,
  SetEditionPricesRequest,
} from "../../domain/entities/EditionPricing";
import { EditionMapper } from "../mappers/EditionMapper";
import type {
  CreateEditionRequest,
  UpdateEditionRequest,
} from "../../domain/entities/EditionRequests";
import type { IEditionService } from "../../domain/interfaces/IEditionService";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";

/**
 * Repository layer implementing client request queries for edition.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class EditionRepository implements IEditionRepository {
  constructor(private readonly service: IEditionService) {}

  async getAll(
    params: PaginationParams & { includeRetired?: boolean }
  ): Promise<PagedResult<Edition>> {
    const result = await this.service.getAll(params);
    return {
      items: result.items.map((m) => EditionMapper.toEntity(m)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<Edition> {
    const model = await this.service.getById(id);
    return EditionMapper.toEntity(model);
  }

  async create(request: CreateEditionRequest): Promise<string> {
    const json = EditionMapper.toCreateJson(request);
    const response = await this.service.create(json);
    return response.id;
  }

  async update(id: string, request: UpdateEditionRequest): Promise<void> {
    const json = EditionMapper.toUpdateJson(request);
    await this.service.update(id, json);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
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
    await this.service.setFeatureValue(
      editionId,
      featureId,
      value,
      displayLabelEn,
      displayLabelAr,
      isHighlight,
      highlightOrder
    );
  }

  async removeFeature(editionId: string, featureId: string): Promise<void> {
    await this.service.removeFeature(editionId, featureId);
  }

  // ── Versioning ──
  async getVersions(editionId: string): Promise<EditionVersion[]> {
    const models = await this.service.getVersions(editionId);
    return models.map((m) => EditionMapper.toVersionEntity(m));
  }

  async createVersion(
    editionId: string,
    changeNotes?: string,
    featureValues?: Record<string, string>,
    pricingSnapshot?: Array<{ currency: string; billingCycle: string; amount: number }>,
    pendingLabels?: Record<string, { en?: string; ar?: string }>
  ): Promise<string> {
    const response = await this.service.createVersion(
      editionId,
      changeNotes,
      featureValues,
      pricingSnapshot,
      pendingLabels
    );
    return response.id;
  }

  async publishVersion(
    editionId: string,
    versionId: string,
    data: { rolloutStrategy: string; scheduledAt?: string; canaryPercentage?: number }
  ): Promise<void> {
    await this.service.publishVersion(editionId, versionId, data);
  }

  async cancelVersion(editionId: string, versionId: string): Promise<void> {
    await this.service.cancelVersion(editionId, versionId);
  }

  async directApplyFeatures(
    editionId: string,
    featureValues: Record<string, string>,
    changedLabels?: Record<string, { en?: string; ar?: string }>
  ): Promise<void> {
    await this.service.directApplyFeatures(editionId, featureValues, changedLabels);
  }

  // ── Pricing ──
  async getEditionPrices(editionId: string): Promise<EditionPriceListResponse> {
    return this.service.getEditionPrices(editionId);
  }

  async setEditionPrices(editionId: string, request: SetEditionPricesRequest): Promise<void> {
    await this.service.setEditionPrices(editionId, request.prices);
  }

  async getExchangeRates(baseCurrency: string = "USD"): Promise<Record<string, number>> {
    return this.service.getExchangeRates(baseCurrency);
  }

  // ── Promotions ──
  async getPromotions(editionId: string) {
    return this.service.getPromotions(editionId);
  }

  async createPromotion(
    editionId: string,
    data: Parameters<typeof this.service.createPromotion>[1]
  ) {
    const response = await this.service.createPromotion(editionId, data);
    return response.id;
  }

  async updatePromotion(
    editionId: string,
    promoId: string,
    data: Parameters<typeof this.service.updatePromotion>[2]
  ) {
    await this.service.updatePromotion(editionId, promoId, data);
  }

  async deletePromotion(editionId: string, promoId: string) {
    await this.service.deletePromotion(editionId, promoId);
  }

  async validatePromoCode(editionId: string, promoCode: string) {
    return this.service.validatePromoCode(editionId, promoCode);
  }
}
