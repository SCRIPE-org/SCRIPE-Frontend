/**
 * Tenant Service Interface
 *
 * Defines the contract for tenant API operations.
 * Implementation in data/services/TenantService.ts
 *
 * @module tenants/domain
 */
import type {
  TenantSettingsModel,
  UpdateTenantSettingsRequest,
} from "@modules/customization/tenant-settings/src/domain/types/SettingsTypes";
import type { TenantModel, TenantTreeNodeModel } from "../types/TenantModelTypes";
import type {
  CreateTenantJson,
  CreateTenantResultJson,
  UpdateTenantJson,
} from "../types/TenantModelTypes";
import type { TenantStats } from "./ITenantRepository";
import type { PermissionModel, PermissionModuleGroupJson } from "@modules/identity/core";
import type {
  SubscriptionModel,
  PagedEditionResult,
  DowngradeImpactReport,
} from "../types/SubscriptionTypes";

/** Tenant domain record from the API */
export interface TenantDomainJson {
  id: string;
  domain: string;
  type: "auto" | "custom";
  isPrimary: boolean;
  isVerified: boolean;
  verificationToken: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

/** Response shape for the domains endpoint */
export interface TenantDomainsResponse {
  domains: TenantDomainJson[];
  cnameTarget: string;
  verificationPrefix: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for service tenant list params.
 */
export interface ServiceTenantListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  parentId?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for tenant list result.
 */
export interface TenantListResult {
  items: TenantModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for tenant tree list result.
 */
export interface TenantTreeListResult {
  items: TenantTreeNodeModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Http API network service for i tenant.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface ITenantService {
  getAll(params: ServiceTenantListParams): Promise<TenantListResult>;
  getTree(): Promise<TenantTreeNodeModel[]>;
  /**
   * Get MY children tenants (for /tenants page - shows only my direct children)
   */
  getMyChildren(params?: ServiceTenantListParams): Promise<TenantTreeListResult>;
  /**
   * Get children of a specific tenant (for /tenants/{id}/children tab)
   */
  getChildren(parentId: string): Promise<TenantTreeNodeModel[]>;
  /**
   * Get current user's tenant AND all children tenants
   * For Admin Transfer dialog - returns own tenant + all descendants
   * System admins get a "System" pseudo-tenant (null ID)
   */
  getMyTenantAndChildren(search?: string): Promise<TenantTreeNodeModel[]>;
  getById(id: string): Promise<TenantModel>;
  getStats(id: string): Promise<TenantStats>;
  create(json: CreateTenantJson): Promise<CreateTenantResultJson>;
  update(id: string, json: UpdateTenantJson): Promise<void>;
  delete(id: string): Promise<void>;
  getDescendantCount(id: string): Promise<number>;
  /**
   * Get available permissions for creating a child tenant
   * @param parentId - Optional parent tenant ID. If null, returns current user's permissions
   */
  getCreationPermissions(parentId?: string, search?: string): Promise<PermissionModel[]>;
  /**
   * Get permissions available to a specific tenant
   * @param tenantId - The tenant ID to get permissions for
   */
  getTenantPermissions(tenantId: string, search?: string): Promise<PermissionModel[]>;
  /**
   * Get permissions available to a specific tenant, grouped by Module → Category.
   * Backend-pre-grouped — no client-side reduce needed.
   */
  getTenantPermissionsGrouped(
    tenantId: string,
    search?: string
  ): Promise<PermissionModuleGroupJson[]>;
  /**
   * Update permissions for a tenant
   * @param tenantId - The tenant ID to update permissions for
   * @param permissionIds - Array of permission IDs to assign
   */
  updateTenantPermissions(tenantId: string, permissionIds: string[]): Promise<void>;

  /**
   * Set the current tenant context for multi-tenant API calls.
   * @param tenantId - The tenant ID to set, or null to clear
   */
  setTenantContext(tenantId: string | null): void;
  /**
   * Toggle tenant status (Active/Inactive)
   * NOTE: Backend requires full update, so implementation must fetch-then-update.
   * @param id - The tenant ID
   * @param isActive - The NEW status to set
   */
  toggleStatus(id: string, isActive: boolean): Promise<void>;

  /**
   * Get settings for a specific tenant
   */
  getSettings(tenantId: string): Promise<TenantSettingsModel>;

  /**
   * Update settings for a specific tenant
   */
  updateSettings(tenantId: string, request: UpdateTenantSettingsRequest): Promise<void>;

  /**
   * Upload tenant logo
   * @param tenantId - The tenant ID
   * @param file - The file to upload
   * @returns The uploaded logo URL
   */
  uploadLogo(tenantId: string, file: File): Promise<{ url: string }>;

  /**
   * Get available editions (plans) for assignment
   */
  getAvailableEditions(
    page?: number,
    pageSize?: number,
    search?: string
  ): Promise<PagedEditionResult>;

  /**
   * Get available promotions for a specific edition
   */
  getEditionPromotions(editionId: string): Promise<
    Array<{
      id: string;
      name: string;
      type: string;
      discountValue: number;
      discountCurrency?: string;
      applicableCycle?: string;
      requiresCode: boolean;
      promoCode?: string;
      isActive: boolean;
      validFrom?: string;
      validUntil?: string;
      maxRedemptions?: number;
      currentRedemptions: number;
      firstTimeOnly: boolean;
    }>
  >;

  /**
   * Validate a promo code for a specific edition (backend validates the secret)
   */
  validatePromoCode(
    editionId: string,
    promoCode: string
  ): Promise<{
    isValid: boolean;
    errorCode?: string;
    errorMessage?: string;
    promotionName?: string;
    discountType?: string;
    discountValue?: number;
  }>;

  /**
   * Assign a base/trial edition (plan) to a newly created tenant
   */
  assignEdition(
    tenantId: string,
    editionId: string,
    type?: string,
    endDate?: string,
    currency?: string,
    promoCode?: string,
    promotionId?: string
  ): Promise<{ id: string }>;

  /**
   * Change the base edition of an existing tenant
   */
  changeEdition(
    tenantId: string,
    editionId: string,
    type?: string,
    currency?: string,
    promoCode?: string,
    promotionId?: string
  ): Promise<void>;

  /** Renew (extend) the current subscription period */
  renewSubscription(tenantId: string, type: string): Promise<string>;

  /** Convert a trial subscription to a real plan */
  convertTrial(tenantId: string, type: string): Promise<string>;

  /** Suspend a subscription (admin action for rules violation) */
  suspendSubscription(
    tenantId: string,
    reason: string,
    useFallback?: boolean,
    refundType?: string,
    customRefundAmount?: number
  ): Promise<string>;

  /** Resume a previously suspended subscription */
  resumeSubscription(tenantId: string, type?: string): Promise<string>;

  /** Cancel a subscription permanently */
  cancelSubscription(
    tenantId: string,
    reason?: string,
    useFallback?: boolean,
    refundType?: string,
    customRefundAmount?: number
  ): Promise<string>;
  /** Re-sync tenant permissions from current edition (data backfill) */
  resyncPermissions(tenantId: string): Promise<void>;
  /**
   * Get all subscriptions for a tenant
   */
  getTenantSubscriptions(tenantId: string): Promise<SubscriptionModel[]>;
  /**
   * Get resolved features (edition + overrides) for a tenant
   * Used by TenantStats to show quota limits without cross-module import
   */
  getResolvedFeatures(tenantId: string): Promise<
    Array<{
      featureId: string;
      key: string;
      nameEn: string;
      nameAr: string;
      effectiveValue: string;
      valueType: string;
      source: string;
    }>
  >;
  /** Change the billing currency of the active subscription */
  changeCurrency(tenantId: string, currency: string): Promise<string>;
  /** Preview downgrade impact before changing edition */
  getDowngradeImpact(tenantId: string, targetEditionId: string): Promise<DowngradeImpactReport>;
  /** Preview resolved price for an edition + currency + type combo */
  previewPrice(editionId: string, currency: string, type: string): Promise<number>;
  // ── Domain Management ─────────────────────────────────────
  /** Get all domains for a tenant */
  getDomains(tenantId: string): Promise<TenantDomainsResponse>;
  /** Add a custom domain to a tenant */
  addDomain(tenantId: string, domain: string): Promise<void>;
  /** Verify DNS for a custom domain */
  verifyDomain(tenantId: string, domainId: string): Promise<void>;
  /** Set a domain as primary */
  setDomainPrimary(tenantId: string, domainId: string): Promise<void>;
  /** Remove a custom domain */
  removeDomain(tenantId: string, domainId: string): Promise<void>;
}
