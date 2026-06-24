/**
 * Inventory Service — HTTP calls only, no business logic.
 * Implements IInventoryService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IInventoryService, InventoryParams } from "../../domain/interfaces/IInventoryService";
import type {
  InventoryItemModel,
  CreateDataInventoryRequest,
  UpdateDataInventoryRequest,
} from "../models/InventoryModels";
import type { PagedResult } from "@core/interfaces/common.interface";

/**
 * API service for executing HTTP calls related to Inventory endpoints.
 */
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

  create(data: CreateDataInventoryRequest): Promise<string> {
    return this.api.post<string>(API_ENDPOINTS.COMPLIANCE.DATA_INVENTORY, data);
  }

  update(id: string, data: UpdateDataInventoryRequest): Promise<void> {
    return this.api.put<void>(API_ENDPOINTS.COMPLIANCE.DATA_INVENTORY_BY_ID(id), data);
  }

  delete(id: string): Promise<void> {
    return this.api.delete<void>(API_ENDPOINTS.COMPLIANCE.DATA_INVENTORY_BY_ID(id));
  }
}
