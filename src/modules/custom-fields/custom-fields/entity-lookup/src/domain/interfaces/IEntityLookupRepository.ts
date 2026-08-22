/**
 * IEntityLookupRepository — what the presentation layer is allowed to see (Wave 4)
 *
 * Method-for-method identical to `IEntityLookupService`, exactly as
 * `ICustomFieldValueRepository` is to `ICustomFieldValueService`. The duplication is the point of
 * the layering rather than an oversight in it: the hooks depend on this interface, so the day a
 * lookup needs caching, request coalescing across two open pickers, or a mapper, that work lands in
 * the repository and no hook changes. Collapsing the two would put every hook directly on the HTTP
 * seam and make that change a rewrite instead of one file.
 */
import type { PagedResult } from "@core/interfaces/common.interface";
import type {
  EntityLookupItem,
  EntityLookupSearchQuery,
  EntityLookupType,
} from "../../data/models/EntityLookupModel";

export interface IEntityLookupRepository {
  /** Types this caller may reference. `[]` means "you may not reference anything" and is not an error. */
  getAvailableTypes(signal?: AbortSignal): Promise<EntityLookupType[]>;

  /** One page of selectable records. Rejects with `EntityLookupError`. */
  search(
    entityTypeKey: string,
    query: EntityLookupSearchQuery,
    signal?: AbortSignal
  ): Promise<PagedResult<EntityLookupItem>>;

  /**
   * Resolves one held reference. Rejects with `EntityLookupError`, whose `kind` keeps 403, 404 and
   * 422 distinct — the whole reason this feature has an error taxonomy.
   */
  resolve(
    entityTypeKey: string,
    encryptedId: string,
    signal?: AbortSignal
  ): Promise<EntityLookupItem>;
}
