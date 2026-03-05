/**
 * Tenant Repository Interface
 *
 * Defines the contract for tenant data operations.
 */
import type { Tenant, TenantData, TenantTreeNode } from "../entities/Tenant";
import type {
  CreateTenantRequest,
  UpdateTenantRequest,
  DeleteTenantRequest,
} from "../entities/TenantRequests";
import type { PagedResult } from "@modules/system/core/domain/types";
import type { Permission } from "@modules/system/permissions/src/domain/entities/Permission";
import type { EditionThinModel, SubscriptionModel, PagedEditionResult, DowngradeImpactReport } from "../../data/models/TenantSubscription";

/**
 * Tenant list query parameters
 */
export interface TenantListParams {
  page: number;
  pageSize: number;
  search?: string;
  parentId?: string;
}

/**
 * Tenant statistics data
 */
export interface TenantStats {
  adminsCount: number;
  rolesCount: number;
  subTenantsCount: number;
  permissionsCount: number;
}

/**
 * Tenant repository interface
 */
export interface ITenantRepository {
  /**
   * Get paginated list of tenants
   */
  getAll(params: TenantListParams): Promise<PagedResult<Tenant>>;

  /**
   * Get the full tenant hierarchy tree (System admin only)
   */
  getTree(): Promise<TenantTreeNode[]>;

  /**
   * Get MY children tenants (for /tenants page)
   * Admin sees only their direct children, not their own tenant
   */
  getMyChildren(params?: TenantListParams): Promise<PagedResult<TenantTreeNode>>;

  /**
   * Get children of a specific tenant (for tenant detail children tab)
   * Returns only DIRECT children of the specified parent
   */
  getChildren(parentId: string): Promise<TenantTreeNode[]>;

  /**
   * Get current user's tenant AND all children tenants
   * For Admin Transfer dialog - returns own tenant + all descendants
   * System admins get a "System" pseudo-tenant (null ID)
   */
  getMyTenantAndChildren(search?: string): Promise<TenantTreeNode[]>;

  /**
   * Get tenant by ID
   */
  getById(id: string): Promise<Tenant>;

  /**
   * Get statistics for a tenant (for dashboard)
   */
  getStats(id: string): Promise<TenantStats>;

  /**
   * Create a new tenant
   */
  create(request: CreateTenantRequest): Promise<string>;

  /**
   * Update an existing tenant
   */
  update(id: string, request: UpdateTenantRequest): Promise<void>;

  /**
   * Delete a tenant (soft delete)
   * @param options - Optional cascade options
   */
  delete(id: string, options?: DeleteTenantRequest): Promise<void>;

  /**
   * Get descendant count (children + grandchildren etc.)
   */
  getDescendantCount(id: string): Promise<number>;

  /**
   * Get available permissions for creating a child tenant.
   * Returns the parent tenant's permissions (child can only have subset of parent).
   * @param parentId - Optional parent tenant ID. If null, uses current user's tenant permissions.
   */
  getCreationPermissions(parentId?: string, search?: string): Promise<Permission[]>;

  /**
   * Get the current permissions assigned to a tenant.
   * @param tenantId - The tenant ID to get permissions for.
   */
  getTenantPermissions(tenantId: string, search?: string): Promise<Permission[]>;

  /**
   * Get available permissions that can be assigned to a tenant based on its parent.
   * For root tenants: returns all system permissions (from current admin's perspective).
   * For child tenants: returns only the parent tenant's permissions.
   * @param tenantId - The tenant ID to get available permissions for.
   * @param parentId - The parent tenant ID (null/undefined for root tenants).
   */
  getAvailablePermissions(
    tenantId: string,
    parentId?: string,
    search?: string
  ): Promise<Permission[]>;

  /**
   * Update permissions for a tenant.
   * @param tenantId - The tenant ID to update permissions for.
   * @param permissionIds - Array of permission IDs to assign.
   */
  updateTenantPermissions(tenantId: string, permissionIds: string[]): Promise<void>;

  /**
   * Set the current tenant context for multi-tenant API calls.
   * This sets the X-Tenant-Id header for subsequent requests.
   * @param tenantId - The tenant ID to set, or null to clear context
   */
  setTenantContext(tenantId: string | null): void;

  /**
   * Get available editions (plans) for assignment
   */
  getAvailableEditions(page?: number, pageSize?: number, search?: string): Promise<PagedEditionResult>;

  /**
   * Get available promotions for a specific edition
   */
  getEditionPromotions(editionId: string): Promise<Array<{
    id: string; name: string; type: string; discountValue: number;
    discountCurrency?: string; applicableCycle?: string; requiresCode: boolean;
    promoCode?: string; isActive: boolean; validFrom?: string; validUntil?: string;
    maxRedemptions?: number; currentRedemptions: number; firstTimeOnly: boolean;
  }>>;

  /**
   * Assign a base edition (plan) to a newly created tenant
   */
  assignEdition(tenantId: string, editionId: string, type?: string, endDate?: string, currency?: string, promoCode?: string, promotionId?: string): Promise<{ id: string }>;

  /**
   * Change the base edition of an existing tenant
   */
  changeEdition(tenantId: string, editionId: string, type?: string, currency?: string, promoCode?: string, promotionId?: string): Promise<void>;

  /** Renew (extend) the current subscription period */
  renewSubscription(tenantId: string, type: string): Promise<string>;

  /** Convert a trial subscription to a real plan */
  convertTrial(tenantId: string, type: string): Promise<string>;

  /** Suspend a subscription (admin action for rules violation) */
  suspendSubscription(tenantId: string, reason: string, useFallback?: boolean): Promise<string>;

  /** Resume a previously suspended subscription */
  resumeSubscription(tenantId: string, type?: string): Promise<string>;

  /** Cancel a subscription permanently */
  cancelSubscription(tenantId: string, reason?: string, useFallback?: boolean): Promise<string>;

  /** Re-sync tenant permissions from current edition (data backfill) */
  resyncPermissions(tenantId: string): Promise<void>;

  /**
   * Get all subscriptions for a tenant
   */
  getTenantSubscriptions(tenantId: string): Promise<SubscriptionModel[]>;

  /**
   * Get resolved features (edition + overrides) for a tenant
   */
  getResolvedFeatures(tenantId: string): Promise<Array<{ name: string; value: string }>>;

  /** Change the billing currency of the active subscription */
  changeCurrency(tenantId: string, currency: string): Promise<string>;

  /** Preview downgrade impact before changing edition */
  getDowngradeImpact(tenantId: string, targetEditionId: string): Promise<DowngradeImpactReport>;

  /** Preview resolved price for an edition + currency + type combo */
  previewPrice(editionId: string, currency: string, type: string): Promise<number>;
}
