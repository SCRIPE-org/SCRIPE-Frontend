/**
 * IStaffMemberRepository Interface
 *
 * Defines the contract for StaffMember data access.
 */
import type { StaffMember } from "../entities/StaffMember";
import type { IdentityUserSearchResult } from "./IStaffMemberService";

/**
 * Documentation for module export
 */
export interface StaffMemberListParams {
  page: number;
  pageSize: number;
  search?: string;
  /** Server-side sort column key (e.g. "firstName") — optional, additive (F-85). */
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

/**
 * Documentation for module export
 */
export interface IStaffMemberRepository {
  getAll(params: StaffMemberListParams): Promise<{
    items: StaffMember[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<StaffMember>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
  searchIdentityUsers(query: string): Promise<IdentityUserSearchResult[]>;
}
