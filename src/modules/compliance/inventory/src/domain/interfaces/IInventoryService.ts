import type { InventoryItemModel } from "../../data/models/InventoryModels";
import type {
  CreateDataInventoryRequest,
  UpdateDataInventoryRequest,
} from "../entities/InventoryItem";
import type { PagedResult } from "@core/interfaces/common.interface";

export interface InventoryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface IInventoryService {
  getAll(params: InventoryParams): Promise<PagedResult<InventoryItemModel>>;
  create(data: CreateDataInventoryRequest): Promise<string>;
  update(id: string, data: UpdateDataInventoryRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
