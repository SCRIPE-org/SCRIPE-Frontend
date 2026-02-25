/**
 * Bundle Repository — uses Service + Mapper
 */
import type { IBundleRepository } from "../../domain/interfaces/IBundleRepository";
import { Bundle } from "../../domain/entities/Bundle";
import { BundleMapper } from "../mappers/BundleMapper";
import type { CreateBundleRequest, UpdateBundleRequest } from "../../domain/entities/BundleRequests";
import type { BundleService } from "../services/BundleService";
import type { PagedResult, PaginationParams } from "@modules/system/core/domain/types";

export class BundleRepository implements IBundleRepository {
      constructor(private readonly service: BundleService) { }

      async getAll(params: PaginationParams): Promise<PagedResult<Bundle>> {
            const result = await this.service.getAll(params);
            return {
                  items: result.items.map((m) => BundleMapper.toEntity(m)),
                  totalCount: result.totalCount,
                  page: result.page,
                  pageSize: result.pageSize,
                  totalPages: result.totalPages,
                  hasNextPage: result.hasNextPage,
                  hasPreviousPage: result.hasPreviousPage,
            };
      }

      async getById(id: string): Promise<Bundle> {
            const model = await this.service.getById(id);
            return BundleMapper.toEntity(model);
      }

      async create(request: CreateBundleRequest): Promise<string> {
            const json = BundleMapper.toCreateJson(request);
            const response = await this.service.create(json);
            return response.id;
      }

      async update(id: string, request: UpdateBundleRequest): Promise<void> {
            const json = BundleMapper.toUpdateJson(request);
            await this.service.update(id, json);
      }

      async delete(id: string): Promise<void> {
            await this.service.delete(id);
      }
}
