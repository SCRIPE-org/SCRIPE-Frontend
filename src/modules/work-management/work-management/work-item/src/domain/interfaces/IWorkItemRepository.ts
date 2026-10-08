/**
 * IWorkItemRepository Interface
 *
 * Defines the contract for WorkItem data access. Works with domain entities.
 */
import type { WorkItem } from "../entities/WorkItem";

export interface WorkItemListParams {
  page: number;
  pageSize: number;
  search?: string;
  ownerEntityTypeKey?: string;
}

/**
 * An admin eligible to be picked in the "Assigned To" search-select.
 * Shape mirrors AssignableAdmin in the Leads module (billing/entitlements) --
 * kept as a local copy since modules don't cross-import domain types.
 */
export interface AssignableAdmin {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  tenantName?: string;
  isPlatformAdmin: boolean;
}

/**
 * Documentation for module export
 */
export interface IWorkItemRepository {
  getAll(
    params: WorkItemListParams
  ): Promise<{
    items: WorkItem[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<WorkItem>;
  create(data: Record<string, unknown>): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
  /** Server search for the "Assigned To" picker -- searches tenant admins by name/username. */
  searchAssignableAdmins(search: string): Promise<AssignableAdmin[]>;
}
