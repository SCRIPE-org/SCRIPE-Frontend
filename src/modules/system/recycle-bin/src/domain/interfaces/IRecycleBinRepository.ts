/**
 * RecycleBin Repository Interface
 *
 * Defines the contract for RecycleBin data access.
 * Repository returns domain Entities (not Models/DTOs).
 * ViewModel depends on this interface.
 *
 * @module recycle-bin/domain
 */
import type { DeletedItem } from "../entities/DeletedItem";

/**
 * Grouped deleted items result (domain entities)
 */
export interface DeletedItemsGrouped {
      tenants: DeletedItem[];
      admins: DeletedItem[];
      users: DeletedItem[];
      roles: DeletedItem[];
      totalCount: number;
}

/**
 * RecycleBin Repository Interface
 */
export interface IRecycleBinRepository {
      /**
       * Get all soft-deleted items grouped by entity type
       */
      getAll(): Promise<DeletedItemsGrouped>;

      /**
       * Restore a single deleted item
       */
      restore(entityType: string, id: string): Promise<void>;

      /**
       * Bulk restore multiple deleted items
       * @returns Count of items successfully restored
       */
      bulkRestore(items: { entityType: string; id: string }[]): Promise<number>;
}
