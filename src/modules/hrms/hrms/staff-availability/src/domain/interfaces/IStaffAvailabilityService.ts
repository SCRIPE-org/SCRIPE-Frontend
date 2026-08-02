/**
 * IStaffAvailabilityService Interface
 *
 * Defines the contract for StaffAvailability API operations.
 * Implemented by StaffAvailabilityService in the data layer.
 */
import type { StaffAvailabilityModel } from "../../data/models/StaffAvailabilityModel";

export interface StaffAvailabilityListResult {
  items: StaffAvailabilityModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IStaffAvailabilityService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<StaffAvailabilityListResult>;
  getById(id: string): Promise<StaffAvailabilityModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
