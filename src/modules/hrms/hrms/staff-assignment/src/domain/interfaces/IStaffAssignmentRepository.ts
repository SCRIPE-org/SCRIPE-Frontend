/**
 * IStaffAssignmentRepository Interface
 *
 * Defines the contract for StaffAssignment data access.
 */
import type { StaffAssignment } from "../entities/StaffAssignment";

export interface StaffAssignmentListParams {
  page: number;
  pageSize: number;
  search?: string;
  /** Server-side sort column key (e.g. "assignmentType") — optional, additive (F-85). */
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

/**
 * Documentation for module export
 */
export interface IStaffAssignmentRepository {
  getAll(params: StaffAssignmentListParams): Promise<{
    items: StaffAssignment[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<StaffAssignment>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
