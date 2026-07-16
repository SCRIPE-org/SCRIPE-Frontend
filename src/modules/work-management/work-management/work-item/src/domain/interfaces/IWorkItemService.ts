/**
 * IWorkItemService Interface
 *
 * Defines the contract for WorkItem API operations.
 */
import type { WorkItemModel } from "../../data/models/WorkItemModel";

export interface WorkItemListResult {
  items: WorkItemModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IWorkItemService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    ownerEntityTypeKey?: string;
  }): Promise<WorkItemListResult>;
  getById(id: string): Promise<WorkItemModel>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
