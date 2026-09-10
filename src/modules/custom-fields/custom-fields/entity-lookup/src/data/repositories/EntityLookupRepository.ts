/**
 * EntityLookup Repository (Wave 4 — EntityReference / UserReference)
 *
 * A pass-through over `IEntityLookupService`, the same shape as `CustomFieldValueRepository`. There
 * is nothing to map (see `EntityLookupModel.ts`) and nothing to cache yet, so every method is one
 * line — and that is the intended state, not a stub waiting to be filled in. What it buys is that
 * the hooks import `IEntityLookupRepository` and never `IApiService`, so caching or coalescing two
 * open pickers onto one request later is a change to this file alone.
 */
import type { PagedResult } from "@core/interfaces/common.interface";
import type {
  EntityLookupItem,
  EntityLookupSearchQuery,
  EntityLookupType,
} from "../models/EntityLookupModel";
import type { IEntityLookupRepository } from "../../domain/interfaces/IEntityLookupRepository";
import type { IEntityLookupService } from "../../domain/interfaces/IEntityLookupService";
import { EntityLookupMapper } from "../mappers/EntityLookupMapper";

export class EntityLookupRepository implements IEntityLookupRepository {
  constructor(private readonly service: IEntityLookupService) {}

  /** Types this caller may reference; `[]` is a legitimate answer. */
  async getAvailableTypes(signal?: AbortSignal): Promise<EntityLookupType[]> {
    const types = await this.service.getAvailableTypes(signal);
    return types.map(EntityLookupMapper.toTypeEntity);
  }

  /** One page of selectable records. */
  async search(
    entityTypeKey: string,
    query: EntityLookupSearchQuery,
    signal?: AbortSignal
  ): Promise<PagedResult<EntityLookupItem>> {
    const result = await this.service.search(entityTypeKey, query, signal);
    return {
      ...result,
      items: result.items.map(EntityLookupMapper.toEntity),
    };
  }

  /** Resolves one held reference; rejects with a classified `EntityLookupError`. */
  async resolve(
    entityTypeKey: string,
    encryptedId: string,
    signal?: AbortSignal
  ): Promise<EntityLookupItem> {
    const item = await this.service.resolve(entityTypeKey, encryptedId, signal);
    return EntityLookupMapper.toEntity(item);
  }
}
