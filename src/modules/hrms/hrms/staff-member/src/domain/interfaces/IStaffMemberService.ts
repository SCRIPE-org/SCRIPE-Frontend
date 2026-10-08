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

/** One Identity Admin or User match for the Linked User Account picker (F-86). */
export interface IdentityUserSearchResult {
  /** Encrypted Identity Admin/User id — sent as-is to the backend. */
  id: string;
  name: string;
  email: string;
  kind: "admin" | "user";
}

/**
 * Documentation for module export
 */
export interface IStaffMemberService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<StaffMemberListResult>;
  getById(id: string): Promise<StaffMemberModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
  /** Search Identity Admins + Users by name/email for the Linked User Account picker (F-86). */
  searchIdentityUsers(query: string): Promise<IdentityUserSearchResult[]>;
}
