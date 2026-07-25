/**
 * IStaffAvailabilityRepository Interface
 *
 * Defines the contract for StaffAvailability data access.
 */
import type { StaffAvailability } from "../entities/StaffAvailability";

export interface StaffAvailabilityListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IStaffAvailabilityRepository {
  getAll(
    params: StaffAvailabilityListParams
  ): Promise<{
    items: StaffAvailability[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<StaffAvailability>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
