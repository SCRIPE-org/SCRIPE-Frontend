/**
 * Tenant Service
 *
 * Handles all API calls for the Tenants module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 *
 * @module tenants/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import {
  TenantModel,
  TenantTreeNodeModel,
  type TenantJson,
  type TenantTreeNodeJson,
  type TenantListResponseJson,
  type CreateTenantJson,
  type UpdateTenantJson,
} from "../models/TenantModel";
import type {
  ITenantService,
  ServiceTenantListParams,
  TenantListResult,
  TenantTreeListResult,
} from "../../domain/interfaces/ITenantService";
import type { TenantStats } from "../../domain/interfaces/ITenantRepository";
import {
  PermissionModel,
  type PermissionJson,
} from "@modules/system/permissions/src/data/models/PermissionModel";
import type {
  TenantSettingsModel,
  UpdateTenantSettingsRequest,
} from "@modules/system/tenant-settings/src/data/models/TenantSettingsModel";
import type {
  EditionThinModel,
  SubscriptionModel,
  PagedEditionResult,
  DowngradeImpactReport,
} from "../models/TenantSubscription";

export class TenantService implements ITenantService {
  constructor(private readonly api: IApiService) { }

  async getAll(params: ServiceTenantListParams): Promise<TenantListResult> {
    const url = buildUrl(API_ENDPOINTS.TENANTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      parentId: params.parentId,
    });

    const response = await this.api.get<TenantListResponseJson>(url);

    return {
      items: response.items.map((json) => TenantModel.fromJson(json)),
      totalCount: response.totalCount,
      page: (response as any).pageNumber || response.page || 1,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getTree(): Promise<TenantTreeNodeModel[]> {
    const jsonList = await this.api.get<TenantTreeNodeJson[]>(API_ENDPOINTS.TENANTS.TREE);
    return jsonList.map((json) => TenantTreeNodeModel.fromJson(json));
  }

  async getMyChildren(params?: ServiceTenantListParams): Promise<TenantTreeListResult> {
    const url = buildUrl(API_ENDPOINTS.TENANTS.MY_CHILDREN, {
      page: params?.page,
      pageSize: params?.pageSize,
      search: params?.search,
    });
    const response = await this.api.get<TenantTreeListResult>(url);
    return {
      items: response.items.map((json: any) => TenantTreeNodeModel.fromJson(json)),
      totalCount: response.totalCount,
      page: (response as any).pageNumber || response.page || 1,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  /**
   * Get current user's tenant AND all children tenants
   * For Admin Transfer dialog - returns own tenant + all descendants
   * System admins get a "System" pseudo-tenant (null ID)
   */
  async getMyTenantAndChildren(search?: string): Promise<TenantTreeNodeModel[]> {
    const url = buildUrl(API_ENDPOINTS.TENANTS.MY_TENANT_AND_CHILDREN, { search });
    const jsonList = await this.api.get<TenantTreeNodeJson[]>(url);
    return jsonList.map((json) => TenantTreeNodeModel.fromJson(json));
  }

  async getChildren(parentId: string): Promise<TenantTreeNodeModel[]> {
    const jsonList = await this.api.get<TenantTreeNodeJson[]>(
      API_ENDPOINTS.TENANTS.CHILDREN(parentId)
    );
    return jsonList.map((json) => TenantTreeNodeModel.fromJson(json));
  }

  async getById(id: string): Promise<TenantModel> {
    const json = await this.api.get<TenantJson>(API_ENDPOINTS.TENANTS.BY_ID(id));
    return TenantModel.fromJson(json);
  }

  async create(json: CreateTenantJson): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.TENANTS.CREATE, json);
  }

  async update(id: string, json: UpdateTenantJson): Promise<void> {
    await this.api.put(API_ENDPOINTS.TENANTS.UPDATE(id), json);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.TENANTS.DELETE(id));
  }

  async getStats(id: string): Promise<TenantStats> {
    return this.api.get<TenantStats>(API_ENDPOINTS.TENANTS.STATS(id));
  }

  async getDescendantCount(id: string): Promise<number> {
    return this.api.get<number>(`${API_ENDPOINTS.TENANTS.BY_ID(id)}/descendant-count`);
  }

  async getCreationPermissions(parentId?: string, search?: string): Promise<PermissionModel[]> {
    const url = buildUrl(API_ENDPOINTS.TENANTS.CREATION_PERMISSIONS, {
      parentId,
      search,
    });
    const jsonList = await this.api.get<PermissionJson[]>(url);
    return jsonList.map((json) => PermissionModel.fromJson(json));
  }

  async getTenantPermissions(tenantId: string, search?: string): Promise<PermissionModel[]> {
    const url = buildUrl(API_ENDPOINTS.TENANTS.PERMISSIONS(tenantId), {
      search,
    });
    const jsonList = await this.api.get<PermissionJson[]>(url);
    return jsonList.map((json) => PermissionModel.fromJson(json));
  }

  async updateTenantPermissions(tenantId: string, permissionIds: string[]): Promise<void> {
    await this.api.put(API_ENDPOINTS.TENANTS.PERMISSIONS(tenantId), { permissionIds });
  }

  async toggleStatus(id: string, isActive: boolean): Promise<void> {
    // Backend requires Name/Description/Address for any update
    // So we must Fetch -> Update
    const current = await this.getById(id);

    const payload: UpdateTenantJson = {
      name: current.name,
      description: current.description,
      address: current.address,
      isActive: isActive,
    };

    await this.api.put(API_ENDPOINTS.TENANTS.UPDATE(id), payload);
  }

  setTenantContext(tenantId: string | null): void {
    this.api.setTenantContext(tenantId);
  }

  async getSettings(tenantId: string): Promise<TenantSettingsModel> {
    return this.api.get<TenantSettingsModel>(API_ENDPOINTS.TENANTS.SETTINGS(tenantId));
  }

  async updateSettings(tenantId: string, request: UpdateTenantSettingsRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.TENANTS.SETTINGS(tenantId), request);
  }

  async uploadLogo(tenantId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    // NOTE: When sending FormData, let the browser set Content-Type header (it adds boundary)
    // ApiService should handle FormData correctly or allow overriding headers
    return this.api.post<{ url: string }>(
      `${API_ENDPOINTS.TENANTS.BY_ID(tenantId)}/logo`,
      formData
      // Assuming ApiService supports a way to handle FormData implicitly or explicitly.
      // If strictly JSON, we might need a specific handling.
      // Standard axios/fetch handles FormData passed as body.
    );
  }

  async getAvailableEditions(page: number = 1, pageSize: number = 100, search?: string): Promise<PagedEditionResult> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.LIST, {
      page,
      pageSize,
      search,
    });
    return this.api.get<PagedEditionResult>(url);
  }

  async getEditionPromotions(editionId: string): Promise<Array<{
    id: string; name: string; type: string; discountValue: number;
    discountCurrency?: string; applicableCycle?: string; requiresCode: boolean;
    isActive: boolean; validFrom?: string; validUntil?: string;
    maxRedemptions?: number; currentRedemptions: number; firstTimeOnly: boolean;
  }>> {
    return this.api.get(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.PROMOTIONS(editionId));
  }

  async validatePromoCode(editionId: string, promoCode: string): Promise<{ isValid: boolean; errorCode?: string; errorMessage?: string; promotionName?: string; discountType?: string; discountValue?: number }> {
    return this.api.post(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.VALIDATE_PROMO_CODE(editionId), { promoCode });
  }

  async assignEdition(
    tenantId: string,
    editionId: string,
    type?: string,
    endDate?: string,
    currency?: string,
    promoCode?: string,
    promotionId?: string
  ): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.ASSIGN(tenantId),
      { editionId, type, endDate, currency: currency || "USD", promoCode, promotionId }
    );
  }

  async changeEdition(tenantId: string, editionId: string, type: string = "Lifetime", currency?: string, promoCode?: string, promotionId?: string): Promise<void> {
    await this.api.put(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CHANGE(tenantId),
      { editionId, type, currency, promoCode, promotionId }
    );
  }

  async renewSubscription(tenantId: string, type: string): Promise<string> {
    const res = await this.api.post<{ message: string }>(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RENEW(tenantId),
      { type }
    );
    return res?.message || "";
  }

  async convertTrial(tenantId: string, type: string): Promise<string> {
    const res = await this.api.post<{ message: string }>(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CONVERT(tenantId),
      { type }
    );
    return res?.message || "";
  }

  async suspendSubscription(tenantId: string, reason: string, useFallback?: boolean, refundType?: string): Promise<string> {
    const res = await this.api.post<{ message: string }>(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.SUSPEND(tenantId),
      { reason, useFallback: useFallback ?? false, refundType: refundType ?? "None" }
    );
    return res?.message || "";
  }

  async resumeSubscription(tenantId: string, type?: string): Promise<string> {
    const res = await this.api.post<{ message: string }>(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RESUME(tenantId),
      type ? { type } : {}
    );
    return res?.message || "";
  }

  async cancelSubscription(tenantId: string, reason?: string, useFallback?: boolean, refundType?: string): Promise<string> {
    const res = await this.api.post<{ message: string }>(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CANCEL(tenantId),
      { reason, useFallback: useFallback ?? false, refundType: refundType ?? "None" }
    );
    return res?.message || "";
  }

  async resyncPermissions(tenantId: string): Promise<void> {
    await this.api.post(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RESYNC(tenantId),
      {}
    );
  }

  async getTenantSubscriptions(tenantId: string): Promise<SubscriptionModel[]> {
    return this.api.get<SubscriptionModel[]>(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.LIST_BY_TENANT(tenantId)
    );
  }

  async getResolvedFeatures(tenantId: string): Promise<Array<{ featureId: string; key: string; nameEn: string; nameAr: string; effectiveValue: string; valueType: string; source: string }>> {
    return this.api.get<Array<{ featureId: string; key: string; nameEn: string; nameAr: string; effectiveValue: string; valueType: string; source: string }>>(
      API_ENDPOINTS.ENTITLEMENTS.TENANT_FEATURES.RESOLVED(tenantId)
    );
  }

  async changeCurrency(tenantId: string, currency: string): Promise<string> {
    const res = await this.api.post<{ message: string }>(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CHANGE_CURRENCY(tenantId),
      { currency }
    );
    return res?.message || "";
  }

  async getDowngradeImpact(tenantId: string, targetEditionId: string): Promise<DowngradeImpactReport> {
    return this.api.get<DowngradeImpactReport>(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.DOWNGRADE_IMPACT(tenantId, targetEditionId)
    );
  }

  async previewPrice(editionId: string, currency: string, type: string): Promise<number> {
    return this.api.get<number>(
      API_ENDPOINTS.ENTITLEMENTS.PRICING.PREVIEW(editionId, currency, type)
    );
  }
}

