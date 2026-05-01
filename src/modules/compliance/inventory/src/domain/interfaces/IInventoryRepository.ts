import type { InventoryItem } from "../entities/InventoryItem";
import type { PagedResult } from "@modules/identity/core/domain/types";
import type { InventoryParams } from "./IInventoryService";

export interface IInventoryRepository {
  getAll(params: InventoryParams): Promise<PagedResult<InventoryItem>>;
}
