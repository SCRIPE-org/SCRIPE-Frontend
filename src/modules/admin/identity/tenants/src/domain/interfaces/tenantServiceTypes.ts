/**
 * tenantServiceTypes — Data transfer shapes and query parameter models for tenant HTTP operations.
 *
 * @module tenants/domain
 */

import type { TenantModel, TenantTreeNodeModel } from "../types/TenantModelTypes";

/**
 * Tenant domain record from the API.
 */
export interface TenantDomainJson {
  /** Unique domain mapping identifier */
  id: string;
  /** Hostname string (e.g. "tenant.example.com") */
  domain: string;
  /** Assignment mode (system provisioned or custom vanity) */
  type: "auto" | "custom";
  /** Whether this record acts as the primary tenant hostname */
  isPrimary: boolean;
  /** Whether DNS ownership has been confirmed */
  isVerified: boolean;
  /** Verification token used for DNS challenge verification */
  verificationToken: string | null;
  /** Timestamp when domain was verified */
  verifiedAt: string | null;
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Response structure for the tenant domains endpoint.
 */
export interface TenantDomainsResponse {
  /** List of configured domains for the tenant */
  domains: TenantDomainJson[];
  /** CNAME target host for custom domain setup */
  cnameTarget: string;
  /** Subdomain prefix expected for TXT validation */
  verificationPrefix: string;
}

/**
 * Parameter payload passed to paginated tenant query endpoints.
 */
export interface ServiceTenantListParams {
  /** 1-based page index */
  page?: number;
  /** Maximum number of records per page */
  pageSize?: number;
  /** Search query string filtering tenant names or codes */
  search?: string;
  /** Optional parent tenant identifier filter */
  parentId?: string;
}

/**
 * Standard paginated list result containing TenantModel items.
 */
export interface TenantListResult {
  /** Array of tenant entity models */
  items: TenantModel[];
  /** Total count of records across all pages */
  totalCount: number;
  /** Current page index */
  page: number;
  /** Current page size */
  pageSize: number;
  /** Total page count calculated by server */
  totalPages: number;
  /** Whether subsequent pages exist */
  hasNextPage: boolean;
  /** Whether preceding pages exist */
  hasPreviousPage: boolean;
}

/**
 * Paginated list result containing hierarchical TenantTreeNodeModel items.
 */
export interface TenantTreeListResult {
  /** Array of hierarchical tenant tree node models */
  items: TenantTreeNodeModel[];
  /** Total count of records across all pages */
  totalCount: number;
  /** Current page index */
  page: number;
  /** Current page size */
  pageSize: number;
  /** Total page count calculated by server */
  totalPages: number;
  /** Whether subsequent pages exist */
  hasNextPage: boolean;
  /** Whether preceding pages exist */
  hasPreviousPage: boolean;
}
