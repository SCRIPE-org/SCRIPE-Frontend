/**
 * RecycleBin Service Interface
 *
 * Defines the contract for RecycleBin API operations.
 * Service returns DeletedItemModel (DTO), not domain entities.
 * Repository uses Mapper to convert to entities.
 *
 * @module recycle-bin/domain
 */
import type { DeletedItemModel } from "../../data/models/DeletedItemModel";

/**
 * Grouped deleted items result from API (via Service)
 */
export interface DeletedItemsListResult {
      tenants: DeletedItemModel[];
      admins: DeletedItemModel[];
      users: DeletedItemModel[];
      roles: DeletedItemModel[];
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
      restore(entityType: string, id: string): Promise<void>;
}
