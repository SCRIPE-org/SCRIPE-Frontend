/**
 * Tenant Repository Interface
 *
 * Defines the contract for tenant data operations.
 */
import type { Tenant, TenantData, TenantTreeNode } from "../entities/Tenant";
import type {
      CreateTenantRequest,
      UpdateTenantRequest,
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
       * Delete a tenant
       */
      delete(id: string): Promise<void>;
}

