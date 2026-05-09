import type {
  InventoryItemModel,
  CreateDataInventoryRequest,
  UpdateDataInventoryRequest,
} from "../../data/models/InventoryModels";
import type { PagedResult } from "@modules/identity/core/domain/types";

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
