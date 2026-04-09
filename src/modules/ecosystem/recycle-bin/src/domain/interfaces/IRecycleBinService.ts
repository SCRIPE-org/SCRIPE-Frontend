/**
 * RecycleBin Service Interface
 *
 * Defines the contract for RecycleBin API operations.
 * Service returns DeletedItemModel (DTO), not domain entities.
 * Repository uses Mapper to convert to entities.
 *
 * @module recycle-bin/domain
 */
import type { DeletedItemModel } from "../types/RecycleBinTypes";

/**
 * Grouped deleted items result from API (via Service)
 */
export interface DeletedItemsListResult {
  tenants: DeletedItemModel[];
  admins: DeletedItemModel[];
  users: DeletedItemModel[];
  roles: DeletedItemModel[];
  userGroups: DeletedItemModel[];
  totalCount: number;
}

/**
 * RecycleBin Service Interface
 */
export interface IRecycleBinService {
  /**
   * Get all soft-deleted items grouped by entity type
   */
  getAll(): Promise<DeletedItemsListResult>;

  /**
   * Restore a single deleted item
   */
  restore(entityType: string, id: string, restoreAdmins?: boolean): Promise<void>;

  /**
   * Bulk restore multiple deleted items
   */
  bulkRestore(items: { entityType: string; id: string; restoreAdmins?: boolean }[]): Promise<number>;
}
