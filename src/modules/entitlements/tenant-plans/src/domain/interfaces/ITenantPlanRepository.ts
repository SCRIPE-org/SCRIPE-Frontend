/**
 * TenantPlan Repository Interface
 */
import type { TenantPlan } from "../entities/TenantPlan";
import type { CreateTenantPlanRequest, UpdateTenantPlanRequest } from "../entities/TenantPlanRequests";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export interface ITenantPlanRepository {
  getAll(tenantId: string, params: PaginationParams): Promise<PagedResult<TenantPlan>>;
  getById(id: string, tenantId: string): Promise<TenantPlan>;
  create(tenantId: string, request: CreateTenantPlanRequest): Promise<string>;
  update(id: string, tenantId: string, request: UpdateTenantPlanRequest): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
}
