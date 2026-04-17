/**
 * TenantPlan Repository — uses Service + Mapper
 */
import type { ITenantPlanRepository } from "../../domain/interfaces/ITenantPlanRepository";
import type { TenantPlan } from "../../domain/entities/TenantPlan";
import type { CreateTenantPlanRequest, UpdateTenantPlanRequest } from "../../domain/entities/TenantPlanRequests";
import { TenantPlanMapper } from "../mappers/TenantPlanMapper";
import type { ITenantPlanService } from "../../domain/interfaces/ITenantPlanService";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export class TenantPlanRepository implements ITenantPlanRepository {
  constructor(private readonly service: ITenantPlanService) {}

  async getAll(tenantId: string, params: PaginationParams): Promise<PagedResult<TenantPlan>> {
    const result = await this.service.getAll(tenantId, params);
    return {
      items: result.items.map((m) => TenantPlanMapper.toEntityFromList(m, tenantId)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string, tenantId: string): Promise<TenantPlan> {
    const model = await this.service.getById(id, tenantId);
    return TenantPlanMapper.toEntity(model);
  }

  async create(tenantId: string, request: CreateTenantPlanRequest): Promise<string> {
    const json = TenantPlanMapper.toCreateJson(request);
    const response = await this.service.create(tenantId, json);
    return response.id;
  }

  async update(id: string, tenantId: string, request: UpdateTenantPlanRequest): Promise<void> {
    const json = TenantPlanMapper.toUpdateJson(request);
    await this.service.update(id, tenantId, json);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.service.delete(id, tenantId);
  }
}
