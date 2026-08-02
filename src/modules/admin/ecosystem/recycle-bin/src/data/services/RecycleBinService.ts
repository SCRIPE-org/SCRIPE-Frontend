/**
 * RecycleBin Service
 *
 * Handles all API calls for the RecycleBin module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 *
 * @module recycle-bin/data
 */
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import { DeletedItemModel, type DeletedItemsResponseJson } from "../models/DeletedItemModel";
import type {
  IRecycleBinService,
  DeletedItemsListResult,
} from "../../domain/interfaces/IRecycleBinService";
import { RECYCLE_BIN_ENDPOINTS } from "./recycle-bin.endpoints";

/**
 * Http API network service for recycle bin.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class RecycleBinService implements IRecycleBinService {
  constructor(private readonly api: IApiService) {}

  async getAll(): Promise<DeletedItemsListResult> {
    const response = await this.api.get<DeletedItemsResponseJson>(RECYCLE_BIN_ENDPOINTS.LIST);

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
    const url = buildUrl(RECYCLE_BIN_ENDPOINTS.RESTORE(entityType, id), {
      restoreAdmins: restoreAdmins ? "true" : undefined,
    });
    await this.api.post(url, {});
  }

  async bulkRestore(
    items: { entityType: string; id: string; restoreAdmins?: boolean }[]
  ): Promise<number> {
    const response = await this.api.post<{ restoredCount: number }>(
      RECYCLE_BIN_ENDPOINTS.BULK_RESTORE,
      items.map((i) => ({ entityType: i.entityType, id: i.id, restoreAdmins: i.restoreAdmins }))
    );
    return response.restoredCount;
  }
}
