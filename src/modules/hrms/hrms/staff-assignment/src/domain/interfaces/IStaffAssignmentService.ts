/**
 * IStaffAssignmentService Interface
 *
 * Defines the contract for StaffAssignment API operations.
 * Implemented by StaffAssignmentService in the data layer.
 */
import type { StaffAssignmentModel } from "../../data/models/StaffAssignmentModel";

export interface StaffAssignmentListResult {
  items: StaffAssignmentModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IStaffAssignmentService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<StaffAssignmentListResult>;
  getById(id: string): Promise<StaffAssignmentModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
