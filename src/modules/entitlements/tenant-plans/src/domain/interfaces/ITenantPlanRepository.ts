/**
 * TenantPlan Repository Interface
 * TenantId is resolved server-side from JWT context.
 */
import type { TenantPlan } from "../entities/TenantPlan";
import type { CreateTenantPlanRequest, UpdateTenantPlanRequest } from "../entities/TenantPlanRequests";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";

export interface ITenantPlanRepository {
  getAll(params: PaginationParams): Promise<PagedResult<TenantPlan>>;
  getById(id: string): Promise<TenantPlan>;
  create(request: CreateTenantPlanRequest): Promise<string>;
  update(id: string, request: UpdateTenantPlanRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
