import type { InventoryItem } from "../entities/InventoryItem";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { InventoryParams } from "./IInventoryService";
import type {
  CreateDataInventoryRequest,
  UpdateDataInventoryRequest,
} from "../entities/InventoryItem";

/**
 * Repository layer implementing client request queries for i inventory.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IInventoryRepository {
  getAll(params: InventoryParams): Promise<PagedResult<InventoryItem>>;
  create(data: CreateDataInventoryRequest): Promise<string>;
  update(id: string, data: UpdateDataInventoryRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
