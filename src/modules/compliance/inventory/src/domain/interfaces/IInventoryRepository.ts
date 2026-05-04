import type { InventoryItem } from "../entities/InventoryItem";
import type { PagedResult } from "@modules/identity/core/domain/types";
import type { InventoryParams } from "./IInventoryService";
import type { CreateDataInventoryRequest, UpdateDataInventoryRequest } from "../../data/models/InventoryModels";

export interface IInventoryRepository {
  getAll(params: InventoryParams): Promise<PagedResult<InventoryItem>>;
  create(data: CreateDataInventoryRequest): Promise<string>;
  update(id: string, data: UpdateDataInventoryRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
