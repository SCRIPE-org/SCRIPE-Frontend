/**
 * Inventory Service — HTTP calls only, no business logic.
 * Implements IInventoryService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IInventoryService, InventoryParams } from "../../domain/interfaces/IInventoryService";
import type { InventoryItemModel } from "../models/InventoryModels";
import type { PagedResult } from "@modules/identity/core/domain/types";

export class InventoryService implements IInventoryService {
  constructor(private readonly api: IApiService) {}

  getAll(params: InventoryParams): Promise<PagedResult<InventoryItemModel>> {
    const url = buildUrl(API_ENDPOINTS.COMPLIANCE.DATA_INVENTORY, {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 50,
      ...(params.search && { search: params.search }),
    });
    return this.api.get<PagedResult<InventoryItemModel>>(url);
  }
}
