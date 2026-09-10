/**
 * OptionSet Entity
 *
 * Domain entity for a shared option set (P-4) -- one reusable, versioned list of options that many
 * Select and MultiSelect field versions can bind to instead of each owning a private copy of the
 * same twenty labels.
 *
 * `stableKey` and tenant scope are immutable after creation: the backend's `UpdateOptionSetRequest`
 * accepts neither, so the edit form must not offer them. See `IOptionSetRepository` for the full
 * write contract.
 *
 * TWO INDEPENDENT REASONS A SET MAY BE UNEDITABLE, AND THE ENTITY CAN ONLY ANSWER ONE
 * ----------------------------------------------------------------------------------
 *  1. `isSystemManaged` -- a platform-MAINTAINED set (the seeded ISO 3166 / ISO 4217 / BCP 47
 *     lists). Refused for everyone, Super Admin included, on all five mutating paths. This entity
 *     answers it definitively, and `isContentEditable` below is that answer.
 *
 *  2. `isPlatformOwned` -- ownership, derived from `TenantId == null`. A tenant may READ a platform
 *     set (inheriting the seeded reference data is the whole point) but not write one. Whether the
 *     CURRENT caller may is a fact about the caller, not about the set, so the entity deliberately
 *     does not fold it into a single "editable" flag. A view must combine `isPlatformOwned` with
 *     whether the principal is platform-level, on top of the permission check.
 *
 * Collapsing the two would produce exactly the wrong UI in both directions: a Super Admin shown an
 * Edit button on an ISO list, or a tenant admin shown one on an inherited platform set.
 */
import type { OptionSetVersion } from "./OptionSetVersion";

/**
 * A set as the read path produces it.
 *
 * Every property is present on `OptionSetResponse`, which is both the list row AND the `set` half of
 * the detail response -- there is no sparse list variant, so (unlike `CustomFieldData`) nothing here
 * can arrive undefined from a list read and be blanked on a later save.
 */
export interface OptionSetData {
  id: string;
  /**
   * Immutable machine key, unique per tenant. The set's portable identity, and the reason an update
   * cannot rename it: a re-import or a platform reconcile matches on this value, so a rename would
   * silently turn an update into a create.
   */
  stableKey: string;
  labelEn: string;
  labelAr: string | null;
  /** Admin-facing note on what the set is for. Optional, up to 1000 characters. */
  description: string | null;
  /** See this file's header, reason 1. */
  isSystemManaged: boolean;
  /** See this file's header, reason 2. Derived server-side from `TenantId == null`. */
  isPlatformOwned: boolean;
  /** Total versions in the chain -- Draft, Published and retired alike. */
  versionCount: number;
  /** The single Published version, or null when the set has none yet. Null is a NORMAL state. */
  publishedVersionId: string | null;
  /** Version number of `publishedVersionId`, null in lockstep with it. */
  publishedVersionNumber: number | null;
}

/**
 * A set together with its version chain -- what `GET {id}` produces.
 *
 * A plain interface rather than a class because it has no behaviour of its own and no identity beyond
 * the set's: every question worth asking is a question about `set` or about one of `versions`. The
 * versions arrive newest-first and must not be re-sorted ascending; see `OptionSetDetailJson`.
 */
export interface OptionSetDetail {
  set: OptionSet;
  versions: OptionSetVersion[];
}

/**
 * OptionSet entity class.
 */
export class OptionSet {
  constructor(public readonly data: OptionSetData) {}

  copyWith(updates: Partial<OptionSetData>): OptionSet {
    return new OptionSet({
      ...this.data,
      ...updates,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get stableKey(): string {
    return this.data.stableKey;
  }

  get labelEn(): string {
    return this.data.labelEn;
  }

  get labelAr(): string | null {
    return this.data.labelAr;
  }

  get description(): string | null {
    return this.data.description;
  }

  get isSystemManaged(): boolean {
    return this.data.isSystemManaged;
  }

  get isPlatformOwned(): boolean {
    return this.data.isPlatformOwned;
  }

  get versionCount(): number {
    return this.data.versionCount;
  }

  get publishedVersionId(): string | null {
    return this.data.publishedVersionId;
  }

  get publishedVersionNumber(): number | null {
    return this.data.publishedVersionNumber;
  }

  /**
   * Whether this set's METADATA AND CONTENTS may be changed at all.
   *
   * False for a system-managed set, which refuses update, delete, create-version, update-version and
   * publish alike -- one flag covering all five, because the backend applies it to all five.
   *
   * NECESSARY, NOT SUFFICIENT. Ownership (`isPlatformOwned`) and permissions are separate gates the
   * caller still has to pass; see this file's header for why they are not folded in here.
   */
  get isContentEditable(): boolean {
    return !this.data.isSystemManaged;
  }

  /**
   * Whether the set is read-only because the platform maintains it -- the inverse of
   * `isContentEditable`, named for the message a screen shows.
   *
   * Worth its own accessor because the UI owes the user a REASON here, not just a disabled button:
   * the backend answers 403 rather than 404 precisely so the set stays visible and explicable.
   */
  get isPlatformMaintained(): boolean {
    return this.data.isSystemManaged;
  }

  /**
   * Whether any version of this set is currently published.
   *
   * The gate on binding: a set whose versions are all drafts exists and is listed, and simply cannot
   * be bound to yet. Reads `publishedVersionId` rather than counting versions, because `versionCount`
   * includes drafts and retired versions.
   */
  get hasPublishedVersion(): boolean {
    return this.data.publishedVersionId !== null;
  }

  /**
   * Whether a field version can be bound to this set right now.
   *
   * Deliberately does NOT consider `isSystemManaged`: the seeded ISO lists are read-only AND fully
   * bindable -- an uneditable country list is the single most useful set in the product. Binding
   * reads a set; it does not mutate one.
   */
  get isBindable(): boolean {
    return this.hasPublishedVersion;
  }

  /**
   * Whether the set has never been versioned.
   *
   * Its own predicate because it is the state `create` leaves behind, and the one an empty-state
   * screen has to explain: the next action is "add a draft version", not "publish".
   */
  get hasNoVersions(): boolean {
    return this.data.versionCount === 0;
  }

  /**
   * The label to show for the active UI language, falling back to the English label when the Arabic
   * one was never filled in (it is optional on both the create and update requests). Never returns an
   * empty string for a set that has a real English label.
   */
  displayLabel(language: string): string {
    if (language === "ar") {
      const ar = this.data.labelAr?.trim();
      if (ar) return ar;
    }
    return this.data.labelEn;
  }
}
