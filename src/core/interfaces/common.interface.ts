/**
 * Common Types for SCRIPE Frontend
 * مرکزی اقسام برائے SCRIPE
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type SortDirection = "asc" | "desc";

export interface SortParams {
  sortBy?: string;
  sortDirection?: SortDirection;
}

export interface ListQueryParams extends PaginationParams, SortParams {
  filters?: Record<string, unknown>;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface BulkOperationResult {
  successCount: number;
  failedCount: number;
  errors?: string[];
}
