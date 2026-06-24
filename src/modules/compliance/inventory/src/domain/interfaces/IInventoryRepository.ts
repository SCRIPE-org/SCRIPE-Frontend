import type { InventoryItem } from "../entities/InventoryItem";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { InventoryParams } from "./IInventoryService";
import type {
  CreateDataInventoryRequest,
  UpdateDataInventoryRequest,
} from "../entities/InventoryItem";

/**
 * Interface defining repository methods for managing Inventory data access.
 */
export interface IInventoryRepository {
  getAll(params: InventoryParams): Promise<PagedResult<InventoryItem>>;
  create(data: CreateDataInventoryRequest): Promise<string>;
  update(id: string, data: UpdateDataInventoryRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
