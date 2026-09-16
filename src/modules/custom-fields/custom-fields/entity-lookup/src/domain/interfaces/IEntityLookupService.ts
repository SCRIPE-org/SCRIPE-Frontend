/**
 * IEntityLookupService — the HTTP seam for the entity-lookup endpoints (Wave 4)
 *
 * Every method takes an optional `AbortSignal`, which the sibling CustomFields services do not.
 * That is not gold-plating: a picker fires a request per debounce window and the answers can arrive
 * out of order, so the caller needs a way to actually cancel — not merely to ignore — a search it
 * has already superseded. `IApiService.get` has accepted a signal all along; nothing in this module
 * had a reason to use it until now.
 */
import type { PagedResult } from "@core/interfaces/common.interface";
import type {
  EntityLookupItem,
  EntityLookupSearchQuery,
  EntityLookupType,
} from "../../data/models/EntityLookupModel";

export interface IEntityLookupService {
  /**
   * The entity types this caller may point a reference at, already filtered server-side.
   *
   * Resolves to `[]` — never rejects — when the caller may reference nothing. That is the server's
   * documented "you may not reference anything" answer, not a failure.
   */
  getAvailableTypes(signal?: AbortSignal): Promise<EntityLookupType[]>;

  /**
   * One page of selectable records of `entityTypeKey`.
   *
   * Rejects with `EntityLookupError` — 403 when the caller lacks the target type's view permission,
   * 404 when the key is not registered.
   */
  search(
    entityTypeKey: string,
    query: EntityLookupSearchQuery,
    signal?: AbortSignal
  ): Promise<PagedResult<EntityLookupItem>>;

  /**
   * Resolves one held reference back to the record it points at.
   *
   * The ONLY way a stored reference ever renders as a name: the server deliberately does not travel
   * the display name with the value, because a snapshotted name would be readable by anyone holding
   * the OWNER record's permission while the name itself is guarded by the TARGET type's.
   *
   * Rejects with `EntityLookupError`, whose `kind` separates "no access" (403) from "record gone"
   * (404) from "stored id malformed" (422). Callers must keep those apart.
   */
  resolve(
    entityTypeKey: string,
    encryptedId: string,
    signal?: AbortSignal
  ): Promise<EntityLookupItem>;
}
