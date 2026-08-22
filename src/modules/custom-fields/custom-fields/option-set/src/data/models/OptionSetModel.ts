/**
 * OptionSet Models (DTOs)
 *
 * Wire shapes for the option-set endpoints (P-4), mirroring
 * `CustomFields.Application.OptionSets.OptionSetDtos` / `OptionSetRequests` one-for-one. The service
 * speaks these; `OptionSetMapper` converts them to the domain entities.
 *
 * WHY A SHARED OPTION SET EXISTS AT ALL
 * -------------------------------------
 * Without it, twenty Select fields that all offer the same twenty labels each own a private copy of
 * them, and renaming one label is twenty edits that drift. A set is that list, versioned, that many
 * field versions can bind to. The versioning is the load-bearing half: stored values point at
 * materialised option rows, so a set's contents can never be edited in place once anything depends
 * on them -- a new version is published and fields are moved to it deliberately.
 *
 * ENUMS ARE STRINGS ON THE WIRE
 * -----------------------------
 * `JsonStringEnumConverter` is registered globally on the API, so `status` arrives as the C# member
 * NAME (`"Draft"`, `"Active"`), never as its numeric value. The two unions below are declared here
 * rather than in the entities for the same reason `CustomFieldValueTypeName` is declared in
 * `CustomFieldValueModel.ts`: the wire is where the closed set is actually defined, and the domain
 * layer imports it from here instead of the two declarations drifting apart.
 *
 * IDS ARE ENCRYPTED STRINGS, NOT GUIDS
 * ------------------------------------
 * Every `id` on this contract is URL-safe Base64 of an AES-GCM ciphertext. Do not parse, compare
 * structurally, or validate one as a GUID -- and do not assume two encryptions of the same row are
 * equal, because the nonce is fresh per call.
 *
 * WHY THESE CONSTRUCTORS TAKE AN OBJECT INSTEAD OF A POSITIONAL ARGUMENT LIST
 * --------------------------------------------------------------------------
 * `FieldGroupModel` takes positional arguments and gets away with it because every parameter up to
 * its single optional is required, so TypeScript rejects a short call. That protection is absent
 * here: `OptionSetResponse` has `labelAr` and `description` adjacent (both `string | null`) and
 * `publishedVersionId`/`publishedVersionNumber` adjacent at the end, and `OptionSetItemResponse` has
 * `labelAr`, `color` and `iconKey` in a row -- three same-typed nullable slots where transposing two
 * compiles clean and mislabels every option. So these follow `SchemaBundleModel`'s object-parameter
 * convention, where the property names carry the meaning.
 */

/**
 * Lifecycle of one option-set version. Mirrors `CustomFields.Domain.Enums.FieldVersionStatus`'s
 * member names in the enum's own declared order.
 *
 * The semantics the UI must respect:
 * - `Draft` is the only editable status. It is documented as safe to edit DESTRUCTIVELY, precisely
 *   because nothing can bind to it.
 * - `Published` is what fields bind to, and exactly one version per set holds it at a time. That
 *   invariant is enforced procedurally by the publish handler, not by a database constraint.
 * - `Deprecated` is a version that was Published and has been superseded. Values captured under it
 *   stay valid and readable; it is simply no longer offered for new binds.
 * - `Archived` is fully retired: historical read only.
 */
export type FieldVersionStatus = "Draft" | "Published" | "Deprecated" | "Archived";

/**
 * Lifecycle of one option. Mirrors `CustomFields.Domain.Enums.FieldOptionStatus`.
 *
 * - `Active` -- offered to new records.
 * - `Deactivated` -- withdrawn from new records, still rendered on records that already use it, and
 *   reactivatable. This is the withdrawal action an admin actually wants.
 * - `Deleted` -- the row itself is soft-deleted, and reaching that state legitimately requires an
 *   explicit remap-or-blank decision on every stored value pointing at the option. That workflow
 *   does not exist, so THIS UI MUST NEVER SEND `Deleted`; see `OptionSetItemWritableStatus`.
 */
export type FieldOptionStatus = "Active" | "Deactivated" | "Deleted";

/**
 * The statuses this client is allowed to WRITE.
 *
 * `Deleted` is excluded at the type level rather than merely documented, because the failure mode is
 * silent and irreversible: the backend accepts the status verbatim, so a stray `Deleted` soft-deletes
 * an option row while stored values still reference it, with no remap decision ever taken. A compile
 * error is the cheapest place to catch that. `OptionSetRepository` re-checks at runtime for the case
 * where a cast smuggles one past the compiler.
 */
export type OptionSetItemWritableStatus = Exclude<FieldOptionStatus, "Deleted">;

/**
 * `OptionSetResponse` -- the list row, and also the `set` half of the detail response. There is no
 * separate sparse list DTO, so (unlike `CustomField`) there is no "populated a form from a list row
 * and blanked half the record" hazard here.
 */
export interface OptionSetJson {
  id: string;
  /** Immutable machine key, unique per (tenant, key). Absent from the UPDATE shape on purpose. */
  stableKey: string;
  labelEn: string;
  labelAr: string | null;
  description: string | null;
  /**
   * True for a set the platform's own code maintains -- the seeded ISO 3166 / ISO 4217 / BCP 47
   * reference lists. ALL FIVE mutating paths (update, delete, create-version, update-version,
   * publish) refuse it, for EVERY caller including a Super Admin, because editing it would put the
   * deployment out of step with the code that maps its keys.
   *
   * The refusal is 403, deliberately not 404: the set is meant to be visible and bindable, so hiding
   * it would send an admin hunting for something listed everywhere else.
   */
  isSystemManaged: boolean;
  /**
   * Derived server-side from `TenantId == null`, never read from a stored ownership column -- there
   * is none, by design. A tenant may READ a platform set (inheriting the seeded reference data is
   * the entire point) but every write guard compares `TenantId` against the caller's, so a
   * tenant-scoped principal cannot mutate one.
   */
  isPlatformOwned: boolean;
  /** Total versions in the chain, Draft and Published and retired alike. */
  versionCount: number;
  /**
   * The single Published version, or null when the set has none yet.
   *
   * Null is a NORMAL state, not an error: a set whose only versions are drafts exists, is listed,
   * and simply cannot be bound to. Any UI that treats null here as "broken set" is wrong.
   */
  publishedVersionId: string | null;
  /** Version number of `publishedVersionId`, null in lockstep with it. */
  publishedVersionNumber: number | null;
}

/**
 * `OptionSetVersionSummaryResponse` -- one version WITHOUT its items, as the detail screen lists it.
 *
 * Carries `itemCount` instead of `items`. It deliberately does NOT carry `optionSetId` either: it is
 * only ever read nested inside the detail response of the set it belongs to, so the parent is already
 * known at every call site.
 */
export interface OptionSetVersionSummaryJson {
  id: string;
  versionNumber: number;
  status: FieldVersionStatus;
  /** ISO-8601 UTC instant, or null for a version that was never published. */
  publishedAtUtc: string | null;
  itemCount: number;
}

/**
 * `OptionSetDetailResponse` -- a set with its whole version chain.
 *
 * `versions` arrives ordered by version number DESCENDING (newest first), from
 * `OptionSetVersionRepository.GetBySetIdAsync`. Callers must not re-sort it ascending "to be tidy":
 * the newest version is the one an admin acts on.
 */
export interface OptionSetDetailJson {
  set: OptionSetJson;
  versions: OptionSetVersionSummaryJson[];
}

/** `OptionSetItemResponse` -- one option inside a version. */
export interface OptionSetItemJson {
  /**
   * The ITEM's id, which is not the id of any field's materialised option row. Binding copies an
   * item into a `FieldOption` and records this id as that row's provenance, so the two are related
   * but never interchangeable.
   */
  id: string;
  /**
   * Machine key, unique per version and compared CASE-INSENSITIVELY by both the item validator and
   * the bind collision check. A materialised option takes this key verbatim, which is why a clash
   * with a field's hand-authored option refuses the bind rather than overwriting anything.
   */
  key: string;
  labelEn: string;
  labelAr: string | null;
  /** Free-form colour token (<=50 chars). Not validated as a hex value by the backend. */
  color: string | null;
  /** Free-form icon key (<=100 chars). Resolved by the client, not by the API. */
  iconKey: string | null;
  sortOrder: number;
  status: FieldOptionStatus;
}

/**
 * `OptionSetVersionResponse` -- one version with its FULL item list. This is the shape a bind
 * decision is made against, which is why it exists separately from the summary.
 *
 * `items` arrives ordered by `sortOrder` ascending, from `OptionSetItemRepository`.
 */
export interface OptionSetVersionJson {
  id: string;
  /** The parent set's encrypted id. Present here and absent from the summary shape. */
  optionSetId: string;
  versionNumber: number;
  status: FieldVersionStatus;
  publishedAtUtc: string | null;
  items: OptionSetItemJson[];
}

/**
 * `OptionSetBindingResult` -- the receipt a bind, rebind or unbind hands back, counting what
 * happened to the target field version's option rows.
 *
 * Every number is a COUNT, not a list of ids: the API reports what changed so an admin can be told,
 * not so a client can reconcile locally. Re-read the field's options if the detail matters.
 */
export interface OptionSetBindingResultJson {
  /** Set items that had no row on this field version yet. */
  inserted: number;
  /** Set-owned rows whose label, colour, icon, order or status had drifted from the source item. */
  updated: number;
  /**
   * Set-owned rows whose source item is gone from the target version. DEACTIVATED, never deleted --
   * stored values still reference them and must stay readable. This is the count that makes rebind
   * the destructive operation of the three and the reason it carries its own permission.
   */
  deactivated: number;
  /** Set-owned rows already identical to their source item. */
  untouched: number;
  /** Hand-authored rows left completely alone. Reported so an admin can be told what survived. */
  preservedLocalOptions: number;
}

/**
 * `CreateOptionSetRequest`.
 *
 * `stableKey` (<=100) and `labelEn` (<=200) are required; `labelAr` (<=200) and `description`
 * (<=1000) are optional.
 *
 * There is no `isSystemManaged` here, deliberately: a request that could set it would let a caller
 * mint a set that nobody -- not even a Super Admin -- can subsequently edit.
 */
export interface CreateOptionSetRequestJson {
  stableKey: string;
  labelEn: string;
  labelAr: string | null;
  description: string | null;
  /**
   * Ask for platform ownership (`TenantId = null`). Re-checked against `IsSuperAdmin` server-side
   * and rejected with 403 otherwise -- it is a REQUEST, not an assertion, exactly like
   * `CreateFieldGroupRequest.isGlobal`.
   */
  isGlobal: boolean;
}

/**
 * `UpdateOptionSetRequest` -- display metadata only.
 *
 * Carries NEITHER `stableKey` NOR `isGlobal`, and the omission is the contract, not an oversight:
 * both are immutable after creation and the backend record has no property to bind them to. Do not
 * add them here to "match" the create request.
 */
export interface UpdateOptionSetRequestJson {
  labelEn: string;
  labelAr: string | null;
  description: string | null;
}

/**
 * `OptionSetItemRequest` -- one item in a submitted list.
 *
 * `key` (<=100) and `labelEn` (<=200) are required; `labelAr` (<=200), `color` (<=50) and `iconKey`
 * (<=100) are optional. Keys must be unique within the list, compared case-insensitively: the
 * backend's own validator rejects a list holding both `u18` and `U18` rather than letting it collide
 * later at bind time, where the refusal is far harder to interpret.
 *
 * `status` narrows to `OptionSetItemWritableStatus` -- see that type for why `Deleted` is unsendable.
 */
export interface OptionSetItemRequestJson {
  key: string;
  labelEn: string;
  labelAr: string | null;
  color: string | null;
  iconKey: string | null;
  sortOrder: number;
  status: OptionSetItemWritableStatus;
}

/**
 * `OptionSetVersionItemsRequest` -- the body for BOTH creating a draft version and replacing a
 * draft's contents.
 *
 * A FULL REPLACE, never a delta: the item list submitted becomes the version's entire contents. An
 * empty list is refused by the backend, because binding a field to an itemless version would
 * deactivate every set-owned option that field currently shows -- a destructive act dressed up as
 * an empty edit.
 */
export interface OptionSetVersionItemsRequestJson {
  items: OptionSetItemRequestJson[];
}

/** `BindOptionSetRequest` -- which published version a field version should follow. */
export interface BindOptionSetRequestJson {
  optionSetVersionId: string;
}

/**
 * One option set, with `fromJson`/`toJson`.
 */
export class OptionSetModel {
  readonly id: string;
  readonly stableKey: string;
  readonly labelEn: string;
  readonly labelAr: string | null;
  readonly description: string | null;
  readonly isSystemManaged: boolean;
  readonly isPlatformOwned: boolean;
  readonly versionCount: number;
  readonly publishedVersionId: string | null;
  readonly publishedVersionNumber: number | null;

  constructor(fields: OptionSetJson) {
    this.id = fields.id;
    this.stableKey = fields.stableKey;
    this.labelEn = fields.labelEn;
    // `?? null` collapses an OMITTED key and an explicit null into one spelling. Both reach us --
    // the MVC pipeline writes nulls, a source-generated context can skip them -- and normalising
    // here means nothing downstream has to test for `undefined` as well.
    this.labelAr = fields.labelAr ?? null;
    this.description = fields.description ?? null;
    // Defaulted to the SAFE value rather than left undefined. An undefined `isSystemManaged` is
    // falsy, so it would render a platform reference list as freely editable and only fail at the
    // server's 403 -- after the admin has typed a whole draft.
    this.isSystemManaged = fields.isSystemManaged ?? false;
    this.isPlatformOwned = fields.isPlatformOwned ?? false;
    this.versionCount = fields.versionCount ?? 0;
    this.publishedVersionId = fields.publishedVersionId ?? null;
    this.publishedVersionNumber = fields.publishedVersionNumber ?? null;
  }

  /** Create an OptionSetModel from API JSON. */
  static fromJson(json: OptionSetJson): OptionSetModel {
    return new OptionSetModel(json);
  }

  /** Convert back to the API JSON shape, in `OptionSetResponse`'s declaration order. */
  toJson(): OptionSetJson {
    return {
      id: this.id,
      stableKey: this.stableKey,
      labelEn: this.labelEn,
      labelAr: this.labelAr,
      description: this.description,
      isSystemManaged: this.isSystemManaged,
      isPlatformOwned: this.isPlatformOwned,
      versionCount: this.versionCount,
      publishedVersionId: this.publishedVersionId,
      publishedVersionNumber: this.publishedVersionNumber,
    };
  }
}

/**
 * One version summary (no items), with `fromJson`/`toJson`.
 */
export class OptionSetVersionSummaryModel {
  readonly id: string;
  readonly versionNumber: number;
  readonly status: FieldVersionStatus;
  readonly publishedAtUtc: string | null;
  readonly itemCount: number;

  constructor(fields: OptionSetVersionSummaryJson) {
    this.id = fields.id;
    this.versionNumber = fields.versionNumber;
    this.status = fields.status;
    this.publishedAtUtc = fields.publishedAtUtc ?? null;
    this.itemCount = fields.itemCount ?? 0;
  }

  /** Create an OptionSetVersionSummaryModel from API JSON. */
  static fromJson(json: OptionSetVersionSummaryJson): OptionSetVersionSummaryModel {
    return new OptionSetVersionSummaryModel(json);
  }

  /** Convert back to the API JSON shape. */
  toJson(): OptionSetVersionSummaryJson {
    return {
      id: this.id,
      versionNumber: this.versionNumber,
      status: this.status,
      publishedAtUtc: this.publishedAtUtc,
      itemCount: this.itemCount,
    };
  }
}

/**
 * A set with its whole version chain, with `fromJson`/`toJson`.
 *
 * `versions` keeps the order the API sent (newest version number first) -- see `OptionSetDetailJson`.
 */
export class OptionSetDetailModel {
  readonly set: OptionSetModel;
  readonly versions: OptionSetVersionSummaryModel[];

  constructor(fields: { set: OptionSetModel; versions: OptionSetVersionSummaryModel[] }) {
    this.set = fields.set;
    this.versions = fields.versions;
  }

  /** Create an OptionSetDetailModel from API JSON. */
  static fromJson(json: OptionSetDetailJson): OptionSetDetailModel {
    return new OptionSetDetailModel({
      set: OptionSetModel.fromJson(json.set),
      // `?? []` guards a set whose version list came back absent rather than empty. A set with no
      // versions is a legitimate, reachable state -- create leaves it that way -- so this must not
      // throw.
      versions: (json.versions ?? []).map((version) =>
        OptionSetVersionSummaryModel.fromJson(version)
      ),
    });
  }

  /** Convert back to the API JSON shape. */
  toJson(): OptionSetDetailJson {
    return {
      set: this.set.toJson(),
      versions: this.versions.map((version) => version.toJson()),
    };
  }
}

/**
 * One option inside a version, with `fromJson`/`toJson`.
 */
export class OptionSetItemModel {
  readonly id: string;
  readonly key: string;
  readonly labelEn: string;
  readonly labelAr: string | null;
  readonly color: string | null;
  readonly iconKey: string | null;
  readonly sortOrder: number;
  readonly status: FieldOptionStatus;

  constructor(fields: OptionSetItemJson) {
    this.id = fields.id;
    this.key = fields.key;
    this.labelEn = fields.labelEn;
    this.labelAr = fields.labelAr ?? null;
    this.color = fields.color ?? null;
    this.iconKey = fields.iconKey ?? null;
    this.sortOrder = fields.sortOrder;
    // Defaulted to Active, matching `OptionSetItemRequest.Status`'s own default on the backend. An
    // undefined status would make every `=== "Active"` test false and hide the whole list.
    this.status = fields.status ?? "Active";
  }

  /** Create an OptionSetItemModel from API JSON. */
  static fromJson(json: OptionSetItemJson): OptionSetItemModel {
    return new OptionSetItemModel(json);
  }

  /** Convert back to the API JSON shape, in `OptionSetItemResponse`'s declaration order. */
  toJson(): OptionSetItemJson {
    return {
      id: this.id,
      key: this.key,
      labelEn: this.labelEn,
      labelAr: this.labelAr,
      color: this.color,
      iconKey: this.iconKey,
      sortOrder: this.sortOrder,
      status: this.status,
    };
  }
}

/**
 * One version with its full item list, with `fromJson`/`toJson`.
 */
export class OptionSetVersionModel {
  readonly id: string;
  readonly optionSetId: string;
  readonly versionNumber: number;
  readonly status: FieldVersionStatus;
  readonly publishedAtUtc: string | null;
  readonly items: OptionSetItemModel[];

  constructor(fields: {
    id: string;
    optionSetId: string;
    versionNumber: number;
    status: FieldVersionStatus;
    publishedAtUtc: string | null;
    items: OptionSetItemModel[];
  }) {
    this.id = fields.id;
    this.optionSetId = fields.optionSetId;
    this.versionNumber = fields.versionNumber;
    this.status = fields.status;
    this.publishedAtUtc = fields.publishedAtUtc ?? null;
    this.items = fields.items;
  }

  /** Create an OptionSetVersionModel from API JSON. */
  static fromJson(json: OptionSetVersionJson): OptionSetVersionModel {
    return new OptionSetVersionModel({
      id: json.id,
      optionSetId: json.optionSetId,
      versionNumber: json.versionNumber,
      status: json.status,
      publishedAtUtc: json.publishedAtUtc ?? null,
      // `?? []` rather than a throw: the backend refuses to CREATE an itemless version, but a
      // version whose items were later soft-deleted reads back empty, and a screen showing "0
      // options" is more useful than a crash.
      items: (json.items ?? []).map((item) => OptionSetItemModel.fromJson(item)),
    });
  }

  /** Convert back to the API JSON shape, in `OptionSetVersionResponse`'s declaration order. */
  toJson(): OptionSetVersionJson {
    return {
      id: this.id,
      optionSetId: this.optionSetId,
      versionNumber: this.versionNumber,
      status: this.status,
      publishedAtUtc: this.publishedAtUtc,
      items: this.items.map((item) => item.toJson()),
    };
  }
}

/**
 * The counts a bind/rebind/unbind returns, with `fromJson`/`toJson`.
 *
 * No `?? 0` defaults on any field, unlike every other model here. A zero fabricated for an absent
 * number would read as "nothing changed" about a write that DID change things -- the one lie this
 * shape must never tell. A malformed body should surface as a failure instead.
 */
export class OptionSetBindingResultModel {
  readonly inserted: number;
  readonly updated: number;
  readonly deactivated: number;
  readonly untouched: number;
  readonly preservedLocalOptions: number;

  constructor(fields: OptionSetBindingResultJson) {
    this.inserted = fields.inserted;
    this.updated = fields.updated;
    this.deactivated = fields.deactivated;
    this.untouched = fields.untouched;
    this.preservedLocalOptions = fields.preservedLocalOptions;
  }

  /** Create an OptionSetBindingResultModel from API JSON. */
  static fromJson(json: OptionSetBindingResultJson): OptionSetBindingResultModel {
    return new OptionSetBindingResultModel(json);
  }

  /** Convert back to the API JSON shape, in `OptionSetBindingResult`'s declaration order. */
  toJson(): OptionSetBindingResultJson {
    return {
      inserted: this.inserted,
      updated: this.updated,
      deactivated: this.deactivated,
      untouched: this.untouched,
      preservedLocalOptions: this.preservedLocalOptions,
    };
  }
}
