/**
 * IQualificationRepository Interface
 *
 * Defines the contract for Qualification data access.
 */
import type { Qualification } from "../entities/Qualification";

export interface QualificationListParams {
  page: number;
  pageSize: number;
  search?: string;
  /** Server-side sort column key (e.g. "title") — optional, additive (F-85). */
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

/**
 * Documentation for module export
 */
export interface IQualificationRepository {
  getAll(params: QualificationListParams): Promise<{
    items: Qualification[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<Qualification>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
