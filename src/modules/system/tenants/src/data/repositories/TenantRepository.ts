/**
 * Tenant Repository Implementation
 *
 * Implements ITenantRepository using TenantService.
 * Uses TenantMapper to convert Models → Entities.
 *
 * @module tenants/data
 */
import type {
      ITenantRepository,
      TenantListParams,
      TenantStats,
} from "../../domain/interfaces/ITenantRepository";
import { Tenant, type TenantTreeNode } from "../../domain/entities/Tenant";
import type {
      CreateTenantRequest,
      UpdateTenantRequest,
      DeleteTenantRequest,
} from "../../domain/entities/TenantRequests";
import type { PagedResult } from "@modules/system/core/domain/types";
import type { ITenantService } from "../services/TenantService";
import { TenantMapper } from "../mappers/TenantMapper";

export class TenantRepository implements ITenantRepository {
      constructor(private readonly service: ITenantService) { }

      async getAll(params: TenantListParams): Promise<PagedResult<Tenant>> {
            const result = await this.service.getAll(params);

            return {
                  items: TenantMapper.toEntityList(result.items),
                  totalCount: result.totalCount,
                  page: result.page,
                  pageSize: result.pageSize,
                  totalPages: result.totalPages,
                  hasNextPage: result.hasNextPage,
                  hasPreviousPage: result.hasPreviousPage,
            };
      }

      async getTree(): Promise<TenantTreeNode[]> {
            const models = await this.service.getTree();
            return TenantMapper.toTreeNodeList(models);
      }

      async getById(id: string): Promise<Tenant> {
            const model = await this.service.getById(id);
            return TenantMapper.toEntity(model);
      }

      async getStats(id: string): Promise<TenantStats> {
            return this.service.getStats(id);
      }

      async create(request: CreateTenantRequest): Promise<string> {
            const model = TenantMapper.toCreateModel(request);
            const response = await this.service.create(model.toJson());
            return response.id;
      }

      async update(id: string, request: UpdateTenantRequest): Promise<void> {
            const model = TenantMapper.toUpdateModel(request);
            await this.service.update(id, model.toJson());
      }

      async delete(id: string, options?: DeleteTenantRequest): Promise<void> {
            const params = new URLSearchParams();
            if (options?.cascadeChildren) {
                  params.append('cascadeChildren', 'true');
            }
            const queryString = params.toString();
            await this.service.delete(queryString ? `${id}?${queryString}` : id);
      }

      async getDescendantCount(id: string): Promise<number> {
            return this.service.getDescendantCount(id);
      }
}
