/**
 * IStaffMemberService Interface
 *
 * Defines the contract for StaffMember API operations.
 * Implemented by StaffMemberService in the data layer.
 */
import type { StaffMemberModel } from "../../data/models/StaffMemberModel";

export interface StaffMemberListResult {
  items: StaffMemberModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IStaffMemberService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<StaffMemberListResult>;
  getById(id: string): Promise<StaffMemberModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
