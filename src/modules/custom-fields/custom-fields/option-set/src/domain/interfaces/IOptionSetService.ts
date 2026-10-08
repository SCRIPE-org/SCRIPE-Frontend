/**
 * IOptionSetService Interface
 *
 * Contract for the twelve option-set API operations (P-4). Implemented by `OptionSetService` in the
 * data layer; speaks Models, not Entities.
 *
 * The method names below deliberately mirror the HTTP verb/route pairs rather than reading like
 * domain actions, because this layer's only job is to be a faithful description of the controller.
 * The domain-shaped names live one layer up, in `IOptionSetRepository`.
 */
import type {
  OptionSetModel,
  OptionSetDetailModel,
  OptionSetVersionModel,
  OptionSetBindingResultModel,
  CreateOptionSetRequestJson,
  UpdateOptionSetRequestJson,
  OptionSetVersionItemsRequestJson,
  BindOptionSetRequestJson,
} from "../../data/models/OptionSetModel";

/**
 * Documentation for module export
 */
export interface IOptionSetService {
  /**
   * `GET /v1/custom-fields/option-sets`
   *
   * Every set visible to the caller: their own tenant's plus every platform-owned one, in one read.
   * There is no filter, no paging and no query parameter of any kind -- the endpoint returns a BARE
   * ARRAY, not a `PagedResult` envelope. Ordered by `labelEn` then `stableKey` server-side, so
   * callers must not re-sort by anything else.
   */
  getAll(): Promise<OptionSetModel[]>;

  /**
   * `GET /v1/custom-fields/option-sets/{id}`
   *
   * One set plus its whole version chain, newest version number FIRST.
   */
  getById(id: string): Promise<OptionSetDetailModel>;

  /**
   * `GET /v1/custom-fields/option-sets/versions/{versionId}`
   *
   * One version with its full item list, items ordered by `sortOrder`. Keyed by the VERSION id, not
   * by set id plus version number -- a binding stores the version's id, so that is the only handle
   * that round-trips.
   */
  getVersion(versionId: string): Promise<OptionSetVersionModel>;

  /**
   * `POST /v1/custom-fields/option-sets` -> 201 `{ id }`
   *
   * The created set has NO versions, so nothing can bind to it until a draft is added and published.
   */
  create(data: CreateOptionSetRequestJson): Promise<{ id: string }>;

  /** `PUT /v1/custom-fields/option-sets/{id}` -> 204. Display metadata only. */
  update(id: string, data: UpdateOptionSetRequestJson): Promise<void>;

  /**
   * `DELETE /v1/custom-fields/option-sets/{id}` -> 204 (soft delete).
   *
   * Refused with 409 while ANY field version, IN ANY TENANT, is still bound to any of this set's
   * versions -- the count crosses tenant boundaries on purpose, because a platform set's dependents
   * live in other tenants. A tenant admin can therefore be blocked by a binding they cannot see.
   */
  delete(id: string): Promise<void>;

  /**
   * `POST /v1/custom-fields/option-sets/{id}/versions` -> 201 `{ id }`
   *
   * Always lands as Draft. There is no create-and-publish shortcut, because the publish handler is
   * the single place the "exactly one Published per set" invariant is enforced -- no database
   * constraint stands behind it.
   */
  createVersion(
    optionSetId: string,
    data: OptionSetVersionItemsRequestJson
  ): Promise<{ id: string }>;

  /**
   * `PUT /v1/custom-fields/option-sets/versions/{versionId}` -> 204
   *
   * FULL REPLACE of a draft's item list, and Draft only -- 409 for any other status. Every item the
   * version should keep must be present in the payload; an omitted item is a deleted item.
   */
  updateVersion(versionId: string, data: OptionSetVersionItemsRequestJson): Promise<void>;

  /**
   * `POST /v1/custom-fields/option-sets/versions/{versionId}/publish` -> 204
   *
   * Promotes a Draft and demotes the incumbent Published version. Moves NO bound field: fields stay
   * pinned to whatever version they were bound to until someone rebinds them.
   */
  publishVersion(versionId: string): Promise<void>;

  /**
   * `POST /v1/custom-fields/option-sets/bindings/{fieldVersionId}` -> 200 `OptionSetBindingResult`
   *
   * First-time bind. 409 when the field version is already bound (use `rebind`), when the target set
   * version is not Published, or when a hand-authored option on that field shares a key with an
   * incoming item -- the refusal names the offending keys, because renaming a local option is a
   * decision only an admin can take.
   */
  bind(
    fieldVersionId: string,
    data: BindOptionSetRequestJson
  ): Promise<OptionSetBindingResultModel>;

  /**
   * `PUT /v1/custom-fields/option-sets/bindings/{fieldVersionId}` -> 200 `OptionSetBindingResult`
   *
   * Move an already-bound field version to a different published set version -- the ONLY way a field
   * ever follows a set's newer item list. 409 when the field version is not bound (use `bind`).
   *
   * The destructive one of the three: rows whose source item is absent from the new version get
   * DEACTIVATED (never deleted), so an admin can withdraw options a tenant is currently offering by
   * rebinding. Hence the separate `.bind` permission rather than reusing `.update`.
   */
  rebind(
    fieldVersionId: string,
    data: BindOptionSetRequestJson
  ): Promise<OptionSetBindingResultModel>;

  /**
   * `DELETE /v1/custom-fields/option-sets/bindings/{fieldVersionId}` -> 200 `OptionSetBindingResult`
   *
   * Clears the binding and leaves every option row exactly as it is, provenance included -- so the
   * field keeps offering what it was offering, and a later rebind reconciles those rows instead of
   * colliding with them. Deactivating them would silently empty a picker whose stored values are all
   * still valid; adopting them would make every future rebind collide on every key.
   */
  unbind(fieldVersionId: string): Promise<OptionSetBindingResultModel>;
}
