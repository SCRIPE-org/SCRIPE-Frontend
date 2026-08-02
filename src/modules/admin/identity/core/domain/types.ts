/**
 * Shared Types for System Module
 *
 * Common types used across all system submodules.
 */

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

/**
 * Paginated result from API
 */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort parameters
 */
export interface SortParams {
  sortBy?: string;
  sortDirection?: SortDirection;
}

/**
 * Combined list query parameters
 */
export interface ListQueryParams extends PaginationParams, SortParams {
  filters?: Record<string, unknown>;
}

/**
 * Base entity with common audit fields
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * API error response shape
 */
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  successCount: number;
  failedCount: number;
  errors?: string[];
}
