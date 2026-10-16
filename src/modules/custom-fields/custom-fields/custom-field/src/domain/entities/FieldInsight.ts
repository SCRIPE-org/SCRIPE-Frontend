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
  "Created" | "Updated" | "Deactivated" | "Reactivated" | "Deleted" | "Restored" | "Purged";

/** Which part of a definition a history entry refers to. */
export type FieldHistoryPart = "Field" | "Definition" | "Version" | "Option" | "VisibilityRule";

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

/**
 * One version in a field's version chain -- `GET /custom-fields/versions/{customFieldId}`.
 *
 * Display-only, same reasoning as `FieldUsage`/`FieldHistoryPage` above: nothing here round-trips
 * through a form. The one consumer today is the option-set binding picker, which needs exactly one
 * fact this shape carries -- WHICH version is the field's live one -- to know what a bind/rebind/
 * unbind call should target; see `resolveActiveFieldVersion`.
 *
 * Deliberately does NOT carry `OptionSetVersionId`: the backend's `FieldVersionSummary` record does
 * not return it (see that record's own doc comment -- the config/concurrency-shaped fields are kept
 * off this read for the same reason), so there is no way for this shape, or anything built on it, to
 * learn ahead of time whether a version already follows a shared set. The binding dialog is built
 * around that absence rather than around a fiction of knowing it -- see
 * `useOptionSetBindingViewModel`'s own header.
 */
export interface FieldVersionSummary {
  /** Encrypted `FieldVersion.Id`. This is the `fieldVersionId` bind/rebind/unbind take. */
  id: string;
  /** 1-based, never reused -- a gap in the sequence means an earlier version was discarded. */
  versionNumber: number;
  status: "Draft" | "Published" | "Deprecated" | "Archived";
  optionCount: number;
  ruleCount: number;
  isPlatformOwned: boolean;
  effectiveFromUtc?: string | null;
  effectiveToUtc?: string | null;
  publishedAtUtc?: string | null;
  /** Encrypted `OptionSetVersion.Id` this version is bound to, or null/undefined when unbound. */
  boundOptionSetVersionId?: string | null;
}

/** The field's whole version chain, newest first, plus the two facts a caller would otherwise scan for. */
export interface FieldVersionsResponse {
  fieldId: string;
  versions: FieldVersionSummary[];
  hasDraft: boolean;
  publishedVersionNumber?: number | null;
}

/**
 * One visibility rule as the ADMINISTRATION surface sees it — Wave 5 row 5.3.
 * Matches FieldVisibilityRuleAdminResponse from backend.
 */
export interface FieldVisibilityRuleAdmin {
  /** The rule's encrypted id. */
  id: string;
  /** The stored JSON payload verbatim, for round-tripping through an editor. */
  expressionJson: string;
  /** Parsed out for display. Null when the stored expression cannot be read. */
  operandFieldKey?: string | null;
  /** Parsed out for display. Null when the expression cannot be read. */
  operator?: string | null;
  /** Evaluation order, for determinism and diagnostics only. */
  priority: number;
  /** True when the stored expression fails to parse. */
  isUnreadable: boolean;
}

/** Create-rule request body. */
export interface CreateFieldVisibilityRuleRequest {
  customFieldId: string;
  expressionJson: string;
  priority?: number;
}

/** Update-rule request body. */
export interface UpdateFieldVisibilityRuleRequest {
  expressionJson: string;
  priority?: number;
}

/**
 * How a conversion between two value types behaves (Wave 6 row 6.2).
 */
export type ConversionKind = "NoChange" | "Lossless" | "Lossy" | "Impossible";

/**
 * One value that could not be converted during dry-run.
 */
export interface ConversionRefusal {
  entityFieldValueId: string;
  ownerEntityId: string;
  reason: string;
}

/**
 * The outcome of a type-change attempt.
 */
export interface ChangeFieldTypeResult {
  jobRunId: string;
  kind: ConversionKind;
  examined: number;
  converted: number;
  refusals: ConversionRefusal[];
  totalRefusals: number;
  applied: boolean;
}

/**
 * The outcome of a type-change rollback attempt.
 *
 * MIRRORS THE BACKEND RECORD EXACTLY, AND MUST KEEP DOING SO.
 * ----------------------------------------------------------------
 * `RollbackFieldTypeChangeCommand.RollbackFieldTypeChangeResult` is returned straight out of
 * `CustomFieldsController.RollbackFieldTypeChange` via `Ok(result.Value)` — there is no reshaping
 * DTO anywhere on the path, and `CustomFieldService` reads it through an unchecked
 * `api.post<RollbackFieldTypeChangeResult>` generic. Nothing at runtime validates that this
 * interface matches what actually arrives, so a name invented here silently reads `undefined`
 * forever. An earlier revision of this interface declared seven properties of which only
 * `restored` was real; the rollback alert rendered "restored N records back to type ''" and the
 * partial-failure counts below were dropped entirely.
 *
 * WHY THE SKIP COUNTS ARE NOT COSMETIC
 * -------------------------------------
 * The command's own doc comment is explicit that it "reports partial failure rather than success:
 * a value row deleted since the change, or a snapshot that cannot be read, is counted and
 * returned. A rollback that silently skipped either would tell an operator their data was restored
 * while leaving converted values in place." Presenting a rollback as clean while `valuesGone` or
 * `unreadable` is non-zero re-creates precisely the failure the backend refuses to commit.
 */
export interface RollbackFieldTypeChangeResult {
  /** Snapshots the run captured — the denominator `restored` should be read against. */
  snapshotsFound: number;
  /** Prior values actually written back. */
  restored: number;
  /** Snapshots whose value row no longer exists, so nothing could be restored onto it. */
  valuesGone: number;
  /** Snapshots that could not be deserialized. Their records still hold converted values. */
  unreadable: number;
  /** Whether the field's declared value type was moved back to the pre-change type. */
  typeReverted: boolean;
}

/**
 * Change-type request payload.
 */
export interface ChangeFieldTypeRequest {
  targetType: string;
  confirmDataLoss?: boolean;
}

/**
 * Result of minting a new draft version of a custom field.
 */
export interface CreateFieldVersionDraftResult {
  draftVersionId: string;
  versionNumber: number;
  optionsCopied: number;
  rulesCopied: number;
  tenantsWithRules: number;
}

/**
 * Result of publishing the draft version of a custom field.
 */
export interface PublishFieldVersionResult {
  publishedVersionId: string;
  versionNumber: number;
  deprecatedVersionId?: string | null;
  rulesOnPublishedVersion: number;
}

/**
 * Result of discarding/archiving the draft version of a custom field.
 */
export interface DiscardFieldVersionDraftResult {
  discardedVersionId: string;
  versionNumber: number;
  optionsRetained: number;
  rulesRetained: number;
}
