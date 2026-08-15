/**
 * Inventory Repository — calls service, maps models → domain entities.
 * Implements IInventoryRepository.
 */
import type { IInventoryRepository } from "../../domain/interfaces/IInventoryRepository";
import type { IInventoryService, InventoryParams } from "../../domain/interfaces/IInventoryService";
import type { InventoryItem } from "../../domain/entities/InventoryItem";
import type { PagedResult } from "@core/interfaces/common.interface";
import { InventoryMapper } from "../mappers/InventoryMapper";
import type {
  CreateDataInventoryRequest,
  UpdateDataInventoryRequest,
} from "../models/InventoryModels";

/**
 * Repository layer implementing client request queries for inventory.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly service: IInventoryService) {}

  async getAll(params: InventoryParams): Promise<PagedResult<InventoryItem>> {
    const result = await this.service.getAll(params);
    return {
      ...result,
      items: result.items.map(InventoryMapper.toEntity),
    };
  }

  create(data: CreateDataInventoryRequest): Promise<string> {
    return this.service.create(data);
  }

  update(id: string, data: UpdateDataInventoryRequest): Promise<void> {
    return this.service.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.service.delete(id);
  }
}
