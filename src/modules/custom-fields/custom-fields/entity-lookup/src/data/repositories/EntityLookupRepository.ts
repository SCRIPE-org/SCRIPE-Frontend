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

export class EntityLookupRepository implements IEntityLookupRepository {
  constructor(private readonly service: IEntityLookupService) {}

  /** Types this caller may reference; `[]` is a legitimate answer. */
  getAvailableTypes(signal?: AbortSignal): Promise<EntityLookupType[]> {
    return this.service.getAvailableTypes(signal);
  }

  /** One page of selectable records. */
  search(
    entityTypeKey: string,
    query: EntityLookupSearchQuery,
    signal?: AbortSignal
  ): Promise<PagedResult<EntityLookupItem>> {
    return this.service.search(entityTypeKey, query, signal);
  }

  /** Resolves one held reference; rejects with a classified `EntityLookupError`. */
  resolve(
    entityTypeKey: string,
    encryptedId: string,
    signal?: AbortSignal
  ): Promise<EntityLookupItem> {
    return this.service.resolve(entityTypeKey, encryptedId, signal);
  }
}
