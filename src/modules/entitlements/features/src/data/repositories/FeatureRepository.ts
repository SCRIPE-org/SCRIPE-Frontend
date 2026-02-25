/**
 * Feature Repository — uses Service + Mapper
 */
import type { IFeatureRepository } from "../../domain/interfaces/IFeatureRepository";
import type { IFeatureService } from "../../domain/interfaces/IFeatureService";
import { Feature } from "../../domain/entities/Feature";
import { FeatureMapper } from "../mappers/FeatureMapper";
import type { CreateFeatureRequest, UpdateFeatureRequest } from "../../domain/entities/FeatureRequests";
import type { PagedResult, PaginationParams } from "@modules/system/core/domain/types";

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

      async getTenantResolvedFeatures(tenantId: string): Promise<any[]> {
            return this.service.getTenantResolvedFeatures(tenantId);
      }
}
