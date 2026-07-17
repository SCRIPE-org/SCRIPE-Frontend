/**
 * Inventory Service — HTTP calls only, no business logic.
 * Implements IInventoryService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IInventoryService, InventoryParams } from "../../domain/interfaces/IInventoryService";
import type {
  InventoryItemModel,
  CreateDataInventoryRequest,
  UpdateDataInventoryRequest,
} from "../models/InventoryModels";
import type { PagedResult } from "@core/interfaces/common.interface";
import { INVENTORY_ENDPOINTS } from "./inventory.endpoints";

/**
 * Http API network service for inventory.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class InventoryService implements IInventoryService {
  constructor(private readonly api: IApiService) {}

  getAll(params: InventoryParams): Promise<PagedResult<InventoryItemModel>> {
    const url = buildUrl(INVENTORY_ENDPOINTS.DATA_INVENTORY, {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 50,
      ...(params.search && { search: params.search }),
    });
    return this.api.get<PagedResult<InventoryItemModel>>(url);
  }

  create(data: CreateDataInventoryRequest): Promise<string> {
    return this.api.post<string>(INVENTORY_ENDPOINTS.DATA_INVENTORY, data);
  }

  update(id: string, data: UpdateDataInventoryRequest): Promise<void> {
    return this.api.put<void>(INVENTORY_ENDPOINTS.DATA_INVENTORY_BY_ID(id), data);
  }

  delete(id: string): Promise<void> {
    return this.api.delete<void>(INVENTORY_ENDPOINTS.DATA_INVENTORY_BY_ID(id));
  }
}
