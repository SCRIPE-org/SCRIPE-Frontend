/**
 * IEmploymentRecordRepository Interface
 *
 * Defines the contract for EmploymentRecord data access.
 */
import type { EmploymentRecord } from "../entities/EmploymentRecord";

export interface EmploymentRecordListParams {
  page: number;
  pageSize: number;
  search?: string;
  /** Server-side sort column key (e.g. "employmentType") — optional, additive (F-85). */
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

/**
 * Documentation for module export
 */
export interface IEmploymentRecordRepository {
  getAll(
    params: EmploymentRecordListParams
  ): Promise<{
    items: EmploymentRecord[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<EmploymentRecord>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
