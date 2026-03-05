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
import type { ITenantService } from "../../domain/interfaces/ITenantService";
import { TenantMapper } from "../mappers/TenantMapper";
import type { Permission } from "@modules/system/permissions/src/domain/entities/Permission";
import { PermissionMapper } from "@modules/system/permissions/src/data/mappers/PermissionMapper";
import { appLogger } from "@core/common/logger";
import type { EditionThinModel, SubscriptionModel, PagedEditionResult, DowngradeImpactReport } from "../models/TenantSubscription";

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

  async getMyChildren(params?: TenantListParams): Promise<PagedResult<TenantTreeNode>> {
    const result = await this.service.getMyChildren(params);
    return {
      items: TenantMapper.toTreeNodeList(result.items),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getChildren(parentId: string): Promise<TenantTreeNode[]> {
    const models = await this.service.getChildren(parentId);
    return TenantMapper.toTreeNodeList(models);
  }

  async getMyTenantAndChildren(search?: string): Promise<TenantTreeNode[]> {
    const models = await this.service.getMyTenantAndChildren(search);
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
      params.append("cascadeChildren", "true");
    }
    const queryString = params.toString();
    await this.service.delete(queryString ? `${id}?${queryString}` : id);
  }

  async getDescendantCount(id: string): Promise<number> {
    return this.service.getDescendantCount(id);
  }

  async getCreationPermissions(parentId?: string, search?: string): Promise<Permission[]> {
    const models = await this.service.getCreationPermissions(parentId, search);
    return PermissionMapper.toEntityList(models);
  }

  async getTenantPermissions(tenantId: string, search?: string): Promise<Permission[]> {
    const models = await this.service.getTenantPermissions(tenantId, search);
    return PermissionMapper.toEntityList(models);
  }

  async getAvailablePermissions(
    tenantId: string,
    parentId?: string,
    search?: string
  ): Promise<Permission[]> {
    appLogger.debug(
      "[Repo] getAvailablePermissions called with tenantId:",
      tenantId,
      "parentId:",
      parentId,
      "search:",
      search
    );
    // If tenant has a parent, get the parent's permissions
    // If tenant is a root tenant (no parent), get all available permissions from current admin's perspective
    if (parentId) {
      // Child tenant: available permissions = parent tenant's permissions
      appLogger.debug("[Repo] Fetching PARENT tenant permissions for:", parentId);
      const models = await this.service.getTenantPermissions(parentId, search);
      appLogger.debug("[Repo] Parent permissions count:", models?.length);
      return PermissionMapper.toEntityList(models);
    } else {
      // Root tenant: available permissions = creation permissions (current admin's perspective)
      appLogger.debug("[Repo] Fetching CREATION permissions (no parent)");
      const models = await this.service.getCreationPermissions(undefined, search);
      appLogger.debug("[Repo] Creation permissions count:", models?.length);
      return PermissionMapper.toEntityList(models);
    }
  }

  async updateTenantPermissions(tenantId: string, permissionIds: string[]): Promise<void> {
    await this.service.updateTenantPermissions(tenantId, permissionIds);
  }

  setTenantContext(tenantId: string | null): void {
    this.service.setTenantContext(tenantId);
  }

  async getAvailableEditions(page?: number, pageSize?: number, search?: string): Promise<PagedEditionResult> {
    return this.service.getAvailableEditions(page, pageSize, search);
  }

  async getEditionPromotions(editionId: string) {
    return this.service.getEditionPromotions(editionId);
  }

  async validatePromoCode(editionId: string, promoCode: string) {
    return this.service.validatePromoCode(editionId, promoCode);
  }

  async assignEdition(tenantId: string, editionId: string, type?: string, endDate?: string, currency?: string, promoCode?: string, promotionId?: string): Promise<{ id: string }> {
    return this.service.assignEdition(tenantId, editionId, type, endDate, currency, promoCode, promotionId);
  }

  async changeEdition(tenantId: string, editionId: string, type: string = "Lifetime", currency?: string, promoCode?: string, promotionId?: string): Promise<void> {
    return this.service.changeEdition(tenantId, editionId, type, currency, promoCode, promotionId);
  }

  async renewSubscription(tenantId: string, type: string): Promise<string> {
    return this.service.renewSubscription(tenantId, type);
  }

  async convertTrial(tenantId: string, type: string): Promise<string> {
    return this.service.convertTrial(tenantId, type);
  }

  async suspendSubscription(tenantId: string, reason: string, useFallback?: boolean): Promise<string> {
    return this.service.suspendSubscription(tenantId, reason, useFallback);
  }

  async resumeSubscription(tenantId: string, type?: string): Promise<string> {
    return this.service.resumeSubscription(tenantId, type);
  }

  async cancelSubscription(tenantId: string, reason?: string, useFallback?: boolean): Promise<string> {
    return this.service.cancelSubscription(tenantId, reason, useFallback);
  }

  async resyncPermissions(tenantId: string): Promise<void> {
    return this.service.resyncPermissions(tenantId);
  }

  async getTenantSubscriptions(tenantId: string): Promise<SubscriptionModel[]> {
    return this.service.getTenantSubscriptions(tenantId);
  }

  async getResolvedFeatures(tenantId: string): Promise<Array<{ name: string; value: string }>> {
    return this.service.getResolvedFeatures(tenantId);
  }

  async changeCurrency(tenantId: string, currency: string): Promise<string> {
    return this.service.changeCurrency(tenantId, currency);
  }

  async getDowngradeImpact(tenantId: string, targetEditionId: string): Promise<DowngradeImpactReport> {
    return this.service.getDowngradeImpact(tenantId, targetEditionId);
  }

  async previewPrice(editionId: string, currency: string, type: string): Promise<number> {
    return this.service.previewPrice(editionId, currency, type);
  }
}
