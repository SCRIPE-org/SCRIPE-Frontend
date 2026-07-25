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
}
