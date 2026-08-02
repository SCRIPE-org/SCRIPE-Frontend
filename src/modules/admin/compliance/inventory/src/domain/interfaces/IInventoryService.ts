import type { InventoryItemModel } from "../../data/models/InventoryModels";
import type {
  CreateDataInventoryRequest,
  UpdateDataInventoryRequest,
} from "../entities/InventoryItem";
import type { PagedResult } from "@core/interfaces/common.interface";

/**
 * Interface defining property specifications, keys types, and structural contract rules for inventory params.
 */
export interface InventoryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Http API network service for i inventory.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IInventoryService {
  getAll(params: InventoryParams): Promise<PagedResult<InventoryItemModel>>;
  create(data: CreateDataInventoryRequest): Promise<string>;
  update(id: string, data: UpdateDataInventoryRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
