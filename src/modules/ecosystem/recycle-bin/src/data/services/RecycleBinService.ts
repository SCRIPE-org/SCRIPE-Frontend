/**
 * RecycleBin Service
 *
 * Handles all API calls for the RecycleBin module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 *
 * @module recycle-bin/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { DeletedItemModel, type DeletedItemsResponseJson } from "../models/DeletedItemModel";
import type {
  IRecycleBinService,
  DeletedItemsListResult,
} from "../../domain/interfaces/IRecycleBinService";

export class RecycleBinService implements IRecycleBinService {
  constructor(private readonly api: IApiService) { }

  async getAll(): Promise<DeletedItemsListResult> {
    const response = await this.api.get<DeletedItemsResponseJson>(API_ENDPOINTS.RECYCLE_BIN.LIST);

    return {
      tenants: (response.tenants ?? []).map((json) => DeletedItemModel.fromJson(json)),
      admins: (response.admins ?? []).map((json) => DeletedItemModel.fromJson(json)),
      users: (response.users ?? []).map((json) => DeletedItemModel.fromJson(json)),
      roles: (response.roles ?? []).map((json) => DeletedItemModel.fromJson(json)),
      userGroups: (response.userGroups ?? []).map((json) => DeletedItemModel.fromJson(json)),
      totalCount: response.totalCount,
    };
  }

  async restore(entityType: string, id: string, restoreAdmins?: boolean): Promise<void> {
    const query = restoreAdmins ? "?restoreAdmins=true" : "";
    await this.api.post(`${API_ENDPOINTS.RECYCLE_BIN.RESTORE(entityType, id)}${query}`, {});
  }

  async bulkRestore(items: { entityType: string; id: string; restoreAdmins?: boolean }[]): Promise<number> {
    const response = await this.api.post<{ restoredCount: number }>(
      API_ENDPOINTS.RECYCLE_BIN.BULK_RESTORE,
      items.map((i) => ({ entityType: i.entityType, id: i.id, restoreAdmins: i.restoreAdmins }))
    );
    return response.restoredCount;
  }
}
