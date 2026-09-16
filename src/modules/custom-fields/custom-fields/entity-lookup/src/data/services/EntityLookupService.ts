/**
 * EntityLookup Service (Wave 4 — EntityReference / UserReference)
 *
 * All HTTP calls for the entity-lookup endpoints. Returns wire models directly; see
 * `EntityLookupModel.ts` for why this submodule has no mapper layer.
 *
 * FAILURES ARE CLASSIFIED HERE, AT THE BOUNDARY
 * ---------------------------------------------
 * Every rejection leaves this class as an `EntityLookupError` carrying a `kind`, the same way
 * `DefinitionExportService` rebuilds a `DefinitionExportError` before it lets one escape. Doing it
 * once at the seam means the two hooks, the control, and anything item 1 adds later all branch on
 * one taxonomy — rather than each re-deriving "was that a permission problem or a deleted record?"
 * from a raw axios rejection, which is exactly how three call sites end up with three answers.
 *
 * `getAvailableTypes` is the exception that proves the rule: it has nothing to classify, because
 * the server's answer to "you may not reference anything" is a 200 with an empty array. An empty
 * list there is data, not a failure, and this file must never turn it into one.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { PagedResult } from "@core/interfaces/common.interface";
import type {
  EntityLookupItem,
  EntityLookupSearchQuery,
  EntityLookupType,
} from "../models/EntityLookupModel";
import { EntityLookupError } from "../../domain/entities/EntityLookupError";
import type { IEntityLookupService } from "../../domain/interfaces/IEntityLookupService";
import { ENTITY_LOOKUP_ENDPOINTS } from "./entity-lookup.endpoints";

export class EntityLookupService implements IEntityLookupService {
  constructor(private readonly api: IApiService) {}

  /**
   * The entity types this caller may point a reference at.
   *
   * `?? []` guards a 204 or an empty body rather than handing `undefined` to a `.map` downstream.
   * Note what it does NOT do: there is no "if empty, throw" arm. A caller with no target-type
   * permissions gets a 200 and an empty array, and the honest rendering of that is "there is
   * nothing you can reference", not an error banner.
   */
  async getAvailableTypes(signal?: AbortSignal): Promise<EntityLookupType[]> {
    const response = await this.api.get<EntityLookupType[]>(
      ENTITY_LOOKUP_ENDPOINTS.TYPES,
      undefined,
      signal
    );
    return response ?? [];
  }

  /**
   * One page of selectable records of `entityTypeKey`.
   *
   * Query values go through `IApiService`'s `params` argument rather than `buildUrl` (which the
   * other services in this module use) for one reason: `search` is user free-text, and axios has to
   * encode it in the same call that carries the `AbortSignal`. `buildUrl` would encode correctly too
   * but would leave the signal as a third positional argument past an already-built URL, which reads
   * as though the two were unrelated.
   *
   * `search: null` is sent as no parameter at all — axios drops `undefined` — so an unfiltered page
   * does not look like a filtered search in a trace.
   */
  async search(
    entityTypeKey: string,
    query: EntityLookupSearchQuery,
    signal?: AbortSignal
  ): Promise<PagedResult<EntityLookupItem>> {
    try {
      return await this.api.get<PagedResult<EntityLookupItem>>(
        ENTITY_LOOKUP_ENDPOINTS.SEARCH(entityTypeKey),
        {
          search: query.search ?? undefined,
          page: query.page,
          pageSize: query.pageSize,
        },
        signal
      );
    } catch (error) {
      throw EntityLookupError.from(error);
    }
  }

  /**
   * Resolves one held reference back to the record it points at.
   *
   * `encryptedId` is passed through untouched — no trimming, no re-encoding. It is the server's own
   * URL-safe base64, and the moment this method "tidies" it the server's `TryDecrypt` returns null
   * and a perfectly good reference reports itself as malformed.
   */
  async resolve(
    entityTypeKey: string,
    encryptedId: string,
    signal?: AbortSignal
  ): Promise<EntityLookupItem> {
    try {
      return await this.api.get<EntityLookupItem>(
        ENTITY_LOOKUP_ENDPOINTS.RESOLVE(entityTypeKey, encryptedId),
        undefined,
        signal
      );
    } catch (error) {
      throw EntityLookupError.from(error);
    }
  }
}
