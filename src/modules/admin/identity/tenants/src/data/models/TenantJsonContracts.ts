/**
 * TenantJsonContracts — JSON wire format contracts and response shapes for tenant API payloads.
 *
 * @module tenants/data
 */

/**
 * Raw JSON payload representing a tenant record returned from backend endpoints.
 */
export interface TenantJson {
  id: string;
  name: string;
  code: string;
  level?: number;
  hierarchyLevel?: number;
  path?: string;
  isActive: boolean;
  createdAt: string;
  parentId?: string;
  parentTenantId?: string;
  parentName?: string;
  parentTenantName?: string;
  description?: string;
  settings?: Record<string, unknown>;
  modifiedAt?: string;
  children?: TenantJson[];
  childCount?: number;
  adminCount?: number;
  address?: string;
  editionName?: string;
  editionEndDate?: string;
  primaryDomain?: string;
  domainCount?: number;
  adminEmail?: string;
  countryCode?: string;
  timeZone?: string;
}

/**
 * Raw hierarchical node representation used in tenant tree views.
 */
export interface TenantTreeNodeJson {
  /** Identifier of the tenant, or null for platform root node */
  id: string | null;
  name: string;
  code: string;
  level: number;
  isActive: boolean;
  isSuspended?: boolean;
  suspensionType?: string;
  suspensionReason?: string;
  description?: string;
  parentId?: string;
  editionName?: string;
  editionEndDate?: string;
  subscriptionStatus?: string;
  children: TenantTreeNodeJson[];
}

/**
 * Paginated tenant list response structure from the API.
 */
export interface TenantListResponseJson {
  items: TenantJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated tenant-tree-node list response structure for child hierarchies.
 */
export interface TenantTreeListResponseJson {
  items: TenantTreeNodeJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * JSON request payload for provisioning a new tenant.
 */
export interface CreateTenantJson {
  name: string;
  code: string;
  parentTenantId?: string;
  description?: string;
  address?: string;
  adminEmail: string;
  adminUsername?: string;
  editionId?: string;
  subscriptionType?: string;
  currency?: string;
  promotionId?: string;
  promoCode?: string;
  skipPayment?: boolean;
  countryCode?: string;
  timeZone?: string;
}

/**
 * Enriched result payload returned by backend after tenant creation.
 */
export interface CreateTenantResultJson {
  tenantId: string;
  adminId: string;
  adminUsername: string;
  adminEmail: string;
  accountSetupUrl: string;
  subscriptionId?: string;
}

/**
 * JSON request payload for updating tenant profile properties.
 */
export interface UpdateTenantJson {
  name?: string;
  description?: string;
  isActive?: boolean;
  address?: string;
  countryCode?: string;
  timeZone?: string;
}
