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
       * Get the full tenant hierarchy tree
       */
      getTree(): Promise<TenantTreeNode[]>;

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
       * Set the current tenant context for multi-tenant API calls.
       * This sets the X-Tenant-Id header for subsequent requests.
       * @param tenantId - The tenant ID to set, or null to clear context
       */
      setTenantContext(tenantId: string | null): void;
}

