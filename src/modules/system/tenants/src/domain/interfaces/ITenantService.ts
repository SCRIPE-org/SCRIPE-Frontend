/**
 * Tenant Service Interface
 *
 * Defines the contract for tenant API operations.
 * Implementation in data/services/TenantService.ts
 *
 * @module tenants/domain
 */
import type { TenantModel, TenantTreeNodeModel } from "../../data/models/TenantModel";
import type {
      CreateTenantJson,
      UpdateTenantJson,
} from "../../data/models/TenantModel";
import type { TenantStats } from "./ITenantRepository";
import type { PermissionModel } from "@modules/system/permissions/src/data/models/PermissionModel";

export interface ServiceTenantListParams {
      page?: number;
      pageSize?: number;
      search?: string;
      parentId?: string;
}

export interface TenantListResult {
      items: TenantModel[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
}

export interface ITenantService {
      getAll(params: ServiceTenantListParams): Promise<TenantListResult>;
      getTree(): Promise<TenantTreeNodeModel[]>;
      /**
       * Get MY children tenants (for /tenants page - shows only my direct children)
       */
      getMyChildren(): Promise<TenantTreeNodeModel[]>;
      /**
       * Get children of a specific tenant (for /tenants/{id}/children tab)
       */
      getChildren(parentId: string): Promise<TenantTreeNodeModel[]>;
      getById(id: string): Promise<TenantModel>;
      getStats(id: string): Promise<TenantStats>;
      create(json: CreateTenantJson): Promise<{ id: string }>;
      update(id: string, json: UpdateTenantJson): Promise<void>;
      delete(id: string): Promise<void>;
      getDescendantCount(id: string): Promise<number>;
      /**
       * Get available permissions for creating a child tenant
       * @param parentId - Optional parent tenant ID. If null, returns current user's permissions
       */
      getCreationPermissions(parentId?: string): Promise<PermissionModel[]>;
      /**
       * Get permissions available to a specific tenant
       * @param tenantId - The tenant ID to get permissions for
       */
      getTenantPermissions(tenantId: string): Promise<PermissionModel[]>;
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
}
