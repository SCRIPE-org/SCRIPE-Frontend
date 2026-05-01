/**
 * Inventory Repository — calls service, maps models → domain entities.
 * Implements IInventoryRepository.
 */
import type { IInventoryRepository } from "../../domain/interfaces/IInventoryRepository";
import type { IInventoryService, InventoryParams } from "../../domain/interfaces/IInventoryService";
import type { InventoryItem } from "../../domain/entities/InventoryItem";
import type { PagedResult } from "@modules/identity/core/domain/types";
import { InventoryMapper } from "../mappers/InventoryMapper";

export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly service: IInventoryService) {}

  async getAll(params: InventoryParams): Promise<PagedResult<InventoryItem>> {
    const result = await this.service.getAll(params);
    return {
      ...result,
      items: result.items.map(InventoryMapper.toEntity),
    };
  }
}
