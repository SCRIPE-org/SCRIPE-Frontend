/**
 * EntityLookup wire models (Wave 4 — EntityReference / UserReference)
 *
 * Verbatim mirrors of `EntityLookupTypeResponse` and `EntityLookupItemResponse` in
 * `SCRIPE-Backend/src/Host/API/Controllers/CustomFields/EntityLookupController.cs`.
 *
 * NO MAPPER LAYER, UNLIKE `field-group/` AND `definition-export/`
 * --------------------------------------------------------------
 * Those submodules map JSON -> Model -> entity because they have something to compute: default
 * labels, derived flags, a filename. These two responses are already the narrowest projection the
 * server is willing to expose — a label, a disambiguator, and one boolean — chosen server-side to
 * be exactly what a picker needs and nothing more. A mapper over them would be a file whose whole
 * body is the identity function, and a second place for a property name to be misspelled. So these
 * interfaces are both the wire shape and the shape the hooks and the control consume.
 *
 * The consequence is that the property names here ARE the contract. If the server renames one, the
 * compiler will not notice — the runtime hands back `undefined` and a picker row renders blank.
 * That is why `EntityLookupService.test.ts` asserts the literal names rather than only the routes.
 */

/**
 * One entity type the current caller may point a reference at.
 *
 * The server returns the FILTERED set — registered, backed by a provider composed into this
 * deployment, and permitted for this caller — not the full catalog. So every key in this list is
 * usable right now, and an EMPTY list is a legitimate answer meaning "you may not reference
 * anything". Treating empty as a failure would turn a correct authorization outcome into a bug
 * report; see `getAvailableTypes` in `EntityLookupService`.
 */
export interface EntityLookupType {
  /** Stable cross-module registry key, e.g. `hrms.staff-member`. Send back verbatim as `entityTypeKey`. */
  key: string;
  /** Owning module name. Present so a picker can GROUP a long list, not so it can filter one. */
  owningModule: string;
  /**
   * English label, server-supplied. Not a translation key — these names come from the module
   * registry, so they are not in our locale files and must not be looked up there.
   */
  displayNameEn: string;
  /** Arabic label, server-supplied. Same reasoning as `displayNameEn`. */
  displayNameAr: string;
}

/**
 * One selectable or resolved record.
 *
 * The SAME shape for a picker row and for a resolved stored reference, because the server routes
 * both through one projection so the two cannot diverge. A control that renders a freshly picked
 * row and a reference loaded from the database is therefore rendering one contract, not two.
 */
export interface EntityLookupItem {
  /**
   * The ENCRYPTED record id, always — never a GUID.
   *
   * Store it and send it back byte for byte. Do not parse it, do not lowercase it, do not validate
   * it against a GUID pattern: it is URL-safe base64 of a ciphertext, and any transformation makes
   * the server's `TryDecrypt` return null, which surfaces as "the stored id is malformed" on a
   * reference that was perfectly good.
   */
  id: string;
  /** Primary label. Never blank — a provider that cannot build one falls back to the id. */
  displayName: string;
  /**
   * Optional disambiguator shown beneath the label (a job title, a code).
   *
   * Null when the owning module judged that any such field would be PII a picker does not need, so
   * a null here is a deliberate decision by that module, not missing data to go looking for.
   */
  secondary: string | null;
  /**
   * False for a row that still exists and is still SELECTABLE but is dormant — a departed staff
   * member kept for historical assignments.
   *
   * Never means deleted: soft-deleted rows are filtered out by the owning module's own repository
   * and do not resolve at all. So a control must mark a dormant row visibly and still accept it;
   * treating `isActive: false` as invalid would make historical references unsavable.
   */
  isActive: boolean;
}

/**
 * Query for one page of an entity type's selectable records.
 *
 * `search` is deliberately nullable rather than optional-and-empty-string: the server treats blank
 * as unfiltered, but sending `search=` leaves every log and trace looking like a filtered search
 * that matched everything, which is the opposite of what happened.
 */
export interface EntityLookupSearchQuery {
  /** Free-text filter; which columns it matches is the owning module's choice. Null means unfiltered. */
  search: string | null;
  /** 1-based. The server clamps values below 1. */
  page: number;
  /**
   * Clamped SERVER-SIDE to `PagedResult.MaxPageSize` (100) — twice, in the controller and in
   * `PagedResult` itself — so asking for more is silently capped, never rejected.
   */
  pageSize: number;
}

/**
 * Default page size for the picker.
 *
 * 20 rather than the server's 100 maximum: a picker's job is to make the first screenful useful
 * enough that paging is rare, and a 100-row first response mostly buys latency for rows nobody
 * scrolls to. `loadMore` covers the rest.
 */
export const ENTITY_LOOKUP_DEFAULT_PAGE_SIZE = 20;

/**
 * Debounce window, in milliseconds, between a keystroke and the search request it causes.
 *
 * 300ms is the house figure (`GenericSelect`'s server-search default). The exact number matters
 * less than the fact that it exists: without it, typing an eight-character name fires eight
 * cross-module queries against another module's repository, seven of whose answers are discarded —
 * and the one that renders is whichever returns last, not the one for what the user typed.
 */
export const ENTITY_LOOKUP_SEARCH_DEBOUNCE_MS = 300;

/**
 * A stored reference, as a custom-field value carries it in either direction.
 *
 * Structurally identical to `CustomFieldEntityReferenceValue` in `CustomFieldValueModel.ts`, and
 * declared here on purpose rather than imported from there:
 *
 *  1. It keeps this submodule free of any dependency on `custom-field-value/`. Lookup is the lower
 *     layer — the definition-target picker will consume it too — and a dependency pointing the
 *     other way would eventually close a cycle.
 *  2. TypeScript is structural, so `CustomFieldEntityReferenceValue` is assignable to this with no
 *     cast, adapter, or re-export.
 *
 * Note the property name: `entityId` is the name on the way down AND on the way up. There is no
 * second spelling to translate into, and renaming it on a save is a data-loss bug — the backend's
 * `Parse` finds no `entityId`, `Validate` answers with the 422 written for a half-filled reference,
 * and on a create the owner row is already committed. The verified backend trace for that lives
 * above `isEntityReferenceValue` in `CustomFieldValueModel.ts`; it is not repeated here because this
 * submodule never constructs a save payload at all.
 */
export interface EntityLookupReference {
  /** Registry key of the referenced type. */
  entityTypeKey: string;
  /** The ENCRYPTED target id, exactly as `EntityLookupItem.id` supplied it. */
  entityId: string;
}
