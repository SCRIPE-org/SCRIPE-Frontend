/**
 * ICertificationRepository Interface
 *
 * Defines the contract for Certification data access.
 */
import type { Certification } from "../entities/Certification";

export interface CertificationListParams {
  page: number;
  pageSize: number;
  search?: string;
  /** Server-side sort column key (e.g. "name") — optional, additive (F-85). */
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

/**
 * Documentation for module export
 */
export interface ICertificationRepository {
  getAll(params: CertificationListParams): Promise<{
    items: Certification[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<Certification>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
