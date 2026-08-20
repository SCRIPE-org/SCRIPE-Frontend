/**
 * Read-only projections behind the history and impact dialogs — Wave 6 rows 6.6 and 6.3.
 *
 * WHY THESE ARE PLAIN TYPES AND NOT ENTITIES
 * ------------------------------------------
 * `CustomField` gets the full entity/model/mapper treatment because it is edited: it round-trips
 * through a form, and a dropped property silently clears stored data (which it did — see
 * `customFieldMapper.completeness.test.ts`). These two are display-only. Nothing writes them back, so
 * there is no round trip to lose anything on, and the ceremony would buy nothing. Same reasoning
 * `EntityTypeInfo` already follows.
 */

/**
 * What happened to a definition, as derived by the server from the audit payload.
 *
 * The server derives these because the audit writer's vocabulary is three words wide
 * (Create/Update/Delete) — a soft delete is stored as an `Update`, so grouping on the raw event type
 * shows nothing. Treated as an open string set on purpose: an unrecognised kind must render as
 * itself rather than being dropped, because a history that quietly omits rows is worse than one
 * showing an unfamiliar label.
 */
export type FieldHistoryChangeKind =
  | "Created"
  | "Updated"
  | "Deactivated"
  | "Reactivated"
  | "Deleted"
  | "Restored"
  | "Purged";

/** Which part of a definition a history entry refers to. */
export type FieldHistoryPart =
  | "Field"
  | "Definition"
  | "Version"
  | "Option"
  | "VisibilityRule";

/** One change to a definition or one of its parts. */
export interface FieldHistoryEntry {
  /** Encrypted audit-entry id. Carried so an entry can be quoted; it links to nothing. */
  id: string;
  timestamp: string;
  /** Open string, not a narrowed union — see `FieldHistoryChangeKind`. */
  changeKind: string;
  part: string;
  changedProperties: string[];
  /**
   * Username as recorded AT THE TIME, not a live lookup. A history must show who it WAS; renaming
   * or deleting the account afterwards must not rewrite the past.
   */
  performedBy?: string | null;
  performedById?: string | null;
  /**
   * Groups the several rows one API call produces — a single field edit writes to CustomField,
   * FieldDefinition and FieldVersion — so the UI can present them as one action.
   */
  correlationId?: string | null;
}

/** One page of a definition's change history. */
export interface FieldHistoryPage {
  items: FieldHistoryEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Value count for one definition within one owner record type. */
export interface FieldUsageByEntityType {
  entityTypeKey: string;
  count: number;
}

/**
 * What a definition is carrying, and what deleting it would cost.
 */
export interface FieldUsage {
  totalValueCount: number;
  byEntityType: FieldUsageByEntityType[];
  /** The pre-Wave-1 table, still dual-written. Reported separately because the two can drift. */
  legacyValueCount: number;
  optionCount: number;
  /** How many rules can hide this field on some records. */
  rulesHidingThisField: number;
  /**
   * How many OTHER fields' visibility depends on this one's value. The impact an admin will not
   * anticipate: deactivating this field makes its value unresolvable, which hides every field
   * conditioned on it.
   */
  fieldsDependingOnThisField: number;
  /** True when the definition is inherited by every organisation. */
  isPlatformOwned: boolean;
  /**
   * Whether the counts above span every organisation or only the caller's own.
   *
   * **The UI MUST label the numbers from this flag rather than assume.** For a platform-owned field
   * the two differ by orders of magnitude and nothing about the number itself reveals which was
   * returned.
   */
  isPlatformWideScope: boolean;
  /** Present only when `isPlatformWideScope`. A count, never the organisations themselves. */
  affectedTenantCount?: number | null;
  /**
   * Whether deleting would eventually destroy stored values.
   *
   * **Gate the confirmation on THIS, never on the counts.** It and the server's own 409 refusal are
   * decided by one expression, so reading the flag makes them unable to disagree — and it is true in
   * cases the visible counts do not show, such as a definition whose rows live only in the legacy
   * table.
   */
  wouldDestroyDataOnDelete: boolean;
}
