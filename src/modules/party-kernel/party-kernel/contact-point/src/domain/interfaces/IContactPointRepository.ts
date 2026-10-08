/**
 * IContactPointRepository Interface
 *
 * Defines the contract for ContactPoint data access.
 */
import type { ContactPoint } from "../entities/ContactPoint";

export interface ContactPointListParams {
  page: number;
  pageSize: number;
  search?: string;
}

/**
 * Documentation for module export
 */
export interface IContactPointRepository {
  getAll(
    params: ContactPointListParams
  ): Promise<{
    items: ContactPoint[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<ContactPoint>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
