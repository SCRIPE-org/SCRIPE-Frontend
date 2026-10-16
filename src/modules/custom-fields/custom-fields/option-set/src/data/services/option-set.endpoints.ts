/**
 * OptionSetsController routes (P-4).
 *
 * All twelve actions of `/api/v1/custom-fields/option-sets` live here, and the shape of that
 * controller is unusual enough to be worth spelling out.
 *
 * ROUTE PRECEDENCE: `versions/{versionId}` AND `bindings/{fieldVersionId}` ARE LITERAL-PREFIXED
 * SIBLINGS OF `{id}`
 * ---------------------------------------------------------------------------------------------
 * `GET versions/{versionId}` and `POST bindings/{fieldVersionId}` sit at the same level as
 * `GET {id}` and `PUT {id}`, so a naive reading says `option-sets/versions/abc` could match
 * `{id}` = "versions" with a trailing segment, or the literal `versions` route. It cannot: in
 * ASP.NET Core a LITERAL segment always outranks a PARAMETER segment, regardless of the order the
 * actions are declared in the controller. That is what makes these unambiguous -- not declaration
 * order, and not any `[Route]` constraint.
 *
 * The consequence worth guarding: renaming either literal to something an `{id}` VALUE could also
 * be would break the disambiguation. Ids on this API are URL-safe Base64 of an AES-GCM ciphertext
 * (`IdEncryptionService.ToUrlSafeBase64` -- `+` and `/` substituted, `=` trimmed), so the literals
 * must stay outside that alphabet's plausible words. `versions` and `bindings` are safe because a
 * caller never mints an id by hand.
 *
 * ID INTERPOLATION IS RAW, AND THAT IS VERIFIED RATHER THAN ASSUMED
 * ----------------------------------------------------------------
 * Ids go straight into the path with no `encodeURIComponent`, matching every other endpoint file in
 * this module. That is safe here specifically because the encryption emits URL-safe Base64 with the
 * padding trimmed: there is no `/`, `+` or `=` to escape. It is NOT a general licence to
 * interpolate -- a natural key would need encoding, which is why no route in this file takes one.
 *
 * THREE VERBS SHARE ONE BINDINGS PATH
 * -----------------------------------
 * Bind (POST), rebind (PUT) and unbind (DELETE) are all `bindings/{fieldVersionId}`. They are
 * named separately below anyway, because at every call site the interesting question is WHICH of
 * the three is happening -- bind refuses when the field version is already bound, rebind refuses
 * when it is not, and only rebind can deactivate options a tenant is currently offering.
 */
import { V1 } from "@/core/config/api-endpoints/_shared";

const BASE = `${V1}/custom-fields/option-sets`;

/**
 * Documentation for module export
 */
export const OPTION_SET_ENDPOINTS = {
  /** `GET ""` -- every set visible to the caller: their tenant's plus every platform-owned one. */
  LIST: BASE,
  /** `GET "{id}"` -- one set plus its whole version chain (`OptionSetDetailResponse`). */
  DETAIL: (id: string) => `${BASE}/${id}`,
  /** `POST ""` -- returns `{ id }`, 201. */
  CREATE: BASE,
  /** `PUT "{id}"` -- display metadata only; `stableKey` and scope are immutable. 204. */
  UPDATE: (id: string) => `${BASE}/${id}`,
  /** `DELETE "{id}"` -- soft delete, refused with 409 while any field anywhere is still bound. */
  DELETE: (id: string) => `${BASE}/${id}`,
  /**
   * `GET "versions/{versionId}"` -- one version with its full item list. Keyed by the VERSION id,
   * not by the set id plus a version number: a version's id is what a binding actually stores.
   */
  VERSION: (versionId: string) => `${BASE}/versions/${versionId}`,
  /**
   * `POST "{id}/versions"` -- the one nested route on this controller, because creating a version
   * needs the parent set. Always lands as Draft; there is no create-and-publish shortcut.
   */
  CREATE_VERSION: (optionSetId: string) => `${BASE}/${optionSetId}/versions`,
  /**
   * `PUT "versions/{versionId}"` -- FULL REPLACE of a draft's item list. Refused with 409 for any
   * status other than Draft, so this is not a general "edit the options" route.
   */
  UPDATE_VERSION: (versionId: string) => `${BASE}/versions/${versionId}`,
  /**
   * `POST "versions/{versionId}/publish"` -- promotes a Draft and demotes the incumbent Published
   * version. Does NOT move any bound field: fields stay pinned to the version they were bound to
   * until an admin rebinds them.
   */
  PUBLISH_VERSION: (versionId: string) => `${BASE}/versions/${versionId}/publish`,
  /** `POST "bindings/{fieldVersionId}"` -- first-time bind. 409 if already bound. */
  BIND: (fieldVersionId: string) => `${BASE}/bindings/${fieldVersionId}`,
  /** `PUT "bindings/{fieldVersionId}"` -- move an already-bound field. 409 if not bound. */
  REBIND: (fieldVersionId: string) => `${BASE}/bindings/${fieldVersionId}`,
  /** `DELETE "bindings/{fieldVersionId}"` -- clears the binding, leaves every option row intact. */
  UNBIND: (fieldVersionId: string) => `${BASE}/bindings/${fieldVersionId}`,
} as const;
