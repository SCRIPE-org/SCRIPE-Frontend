/**
 * RecycleBin Repository Implementation
 *
 * Implements IRecycleBinRepository using the RecycleBinService.
 * Uses DeletedItemMapper to convert between Models (DTOs) and Entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns Models
 * - Repository uses Mapper to convert to Entities
 * - ViewModel uses Repository, works with Entities
 *
 * @module recycle-bin/data
 */
import type {
  IRecycleBinRepository,
  DeletedItemsGrouped,
} from "../../domain/interfaces/IRecycleBinRepository";
import type { IRecycleBinService } from "../../domain/interfaces/IRecycleBinService";
import { DeletedItemMapper } from "../mappers/DeletedItemMapper";

export class RecycleBinRepository implements IRecycleBinRepository {
  constructor(private readonly service: IRecycleBinService) {}

  async getAll(): Promise<DeletedItemsGrouped> {
    const result = await this.service.getAll();

    return {
      tenants: DeletedItemMapper.toEntityList(result.tenants),
      admins: DeletedItemMapper.toEntityList(result.admins),
      users: DeletedItemMapper.toEntityList(result.users),
      roles: DeletedItemMapper.toEntityList(result.roles),
      userGroups: DeletedItemMapper.toEntityList(result.userGroups),
      totalCount: result.totalCount,
    };
  }

  async restore(entityType: string, id: string, restoreAdmins?: boolean): Promise<void> {
    await this.service.restore(entityType, id, restoreAdmins);
  }

  async bulkRestore(
    items: { entityType: string; id: string; restoreAdmins?: boolean }[]
  ): Promise<number> {
    return this.service.bulkRestore(items);
  }
}
