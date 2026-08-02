/**
 * IHrmsRepository Interface
 *
 * Defines the contract for Hrms data access.
 * Works with domain entities, not DTOs.
 */
import type { Hrms } from "../entities/Hrms";

export interface HrmsListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IHrmsRepository {
  getAll(
    params: HrmsListParams
  ): Promise<{
    items: Hrms[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<Hrms>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
