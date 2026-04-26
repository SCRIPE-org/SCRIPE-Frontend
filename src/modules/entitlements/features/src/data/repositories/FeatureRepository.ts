/**
 * Feature Repository — uses Service + Mapper
 *
 * All model→entity conversion goes through FeatureMapper.
 * Never constructs domain entities directly from models.
 */
import type { IFeatureRepository } from "../../domain/interfaces/IFeatureRepository";
import type { IFeatureService } from "../../domain/interfaces/IFeatureService";
import type { Feature } from "../../domain/entities/Feature";
import type { TenantEffectiveFeature } from "../../domain/entities/TenantEffectiveFeature";
import { FeatureMapper } from "../mappers/FeatureMapper";
import type { CreateFeatureRequest, UpdateFeatureRequest } from "../../domain/entities/FeatureRequests";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export class FeatureRepository implements IFeatureRepository {
      constructor(private readonly service: IFeatureService) { }

      async getAll(params: PaginationParams): Promise<PagedResult<Feature>> {
            const result = await this.service.getAll(params);
            return {
                  items: result.items.map((m) => FeatureMapper.toEntity(m)),
                  totalCount: result.totalCount,
                  page: result.page,
                  pageSize: result.pageSize,
                  totalPages: result.totalPages,
                  hasNextPage: result.hasNextPage,
                  hasPreviousPage: result.hasPreviousPage,
            };
      }

      async getById(id: string): Promise<Feature> {
            const model = await this.service.getById(id);
            return FeatureMapper.toEntity(model);
      }

      async create(request: CreateFeatureRequest): Promise<string> {
            const json = FeatureMapper.toCreateJson(request);
            const response = await this.service.create(json);
            return response.id;
      }

      async update(id: string, request: UpdateFeatureRequest): Promise<void> {
            const json = FeatureMapper.toUpdateJson(request);
            await this.service.update(id, json);
      }

      async delete(id: string): Promise<void> {
            await this.service.delete(id);
      }

      async getTenantResolvedFeatures(tenantId: string): Promise<TenantEffectiveFeature[]> {
            const models = await this.service.getTenantResolvedFeatures(tenantId);
            return models.map((m) => FeatureMapper.toEffectiveEntity(m));
      }

      async getEffective(tenantId?: string): Promise<TenantEffectiveFeature[]> {
            const models = await this.service.getEffective(tenantId);
            return models.map((m) => FeatureMapper.toEffectiveEntity(m));
      }

      /**
       * Fetch ALL features from the catalog by auto-paginating.
       * Replaces the dangerous pageSize:1000 pattern that was silently
       * truncated by the backend's Math.Min(pageSize, 100) guard.
       */
      async getAllFeatures(): Promise<Feature[]> {
            const allItems: Feature[] = [];
            let page = 1;
            const pageSize = 100;
            let hasMore = true;

            while (hasMore) {
                  const result = await this.getAll({ page, pageSize });
                  allItems.push(...result.items);
                  hasMore = result.hasNextPage;
                  page++;
            }

            return allItems;
      }
}
