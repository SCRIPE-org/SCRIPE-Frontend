/**
 * IOptionSetRepository Interface
 *
 * Contract for option-set data access (P-4). Works with domain entities, not DTOs.
 *
 * THE WRITE CONTRACT, in full, because five parts of it are easy to get wrong:
 *
 *  1. `update` accepts NO `stableKey` and NO scope flag. Both are immutable after creation and
 *     `UpdateOptionSetRequest` has no property to bind them to. The implementation narrows its input
 *     rather than spreading it, so widening `UpdateOptionSetInput` later cannot leak either one.
 *
 *  2. `createVersion` and `updateVersion` both take the FULL item list -- a replace, never a delta.
 *     An item missing from the payload is an item deleted from the version. An EMPTY list is refused
 *     server-side, because binding a field to an itemless version would deactivate every set-owned
 *     option that field currently shows.
 *
 *  3. `updateVersion` works on DRAFTS ONLY. Editing a published version would retroactively change
 *     what already-stored values mean, with no record that it happened; the backend answers 409.
 *
 *  4. NO WRITE PATH MAY CARRY `FieldOptionStatus.Deleted`. `OptionSetItemInput.status` excludes it at
 *     the type level and the implementation re-checks at runtime, because the backend takes the
 *     status verbatim: a stray `Deleted` soft-deletes an option row while stored values still point
 *     at it, and legitimately reaching that state requires a per-value remap-or-blank decision that
 *     does not exist as a workflow. Deactivating is the withdrawal action -- a deactivated option
 *     stops being offered and still renders on records already using it.
 *
 *  5. Every mutating path refuses a SYSTEM-MANAGED set, for every caller including a Super Admin.
 *     Check `OptionSet.isContentEditable` before offering any of update / delete / createVersion /
 *     updateVersion / publishVersion, so the refusal is a disabled control with an explanation
 *     rather than a 403 after the admin has typed a whole draft.
 */
import type { OptionSet, OptionSetDetail } from "../entities/OptionSet";
import type { OptionSetVersion } from "../entities/OptionSetVersion";
import type { OptionSetItemWritableStatus } from "../entities/OptionSetItem";

export interface CreateOptionSetInput {
  /** Immutable machine key, <=100 chars, unique per tenant. Absent from the update input on purpose. */
  stableKey: string;
  labelEn: string;
  labelAr?: string | null;
  description?: string | null;
  /**
   * Ask for platform ownership. Re-checked against super-admin status server-side and rejected with
   * 403 otherwise -- a request, never an assertion.
   */
  isGlobal: boolean;
}

export interface UpdateOptionSetInput {
  labelEn: string;
  labelAr?: string | null;
  description?: string | null;
}

/**
 * One item in a submitted version item list.
 *
 * `status` is `OptionSetItemWritableStatus`, not `FieldOptionStatus` -- see point 4 of this file's
 * header. `OptionSetItem.writableStatus` produces a safe value from a loaded item.
 */
export interface OptionSetItemInput {
  key: string;
  labelEn: string;
  labelAr?: string | null;
  color?: string | null;
  iconKey?: string | null;
  sortOrder: number;
  status: OptionSetItemWritableStatus;
}

/**
 * What a bind, rebind or unbind did to the target field version's option rows.
 *
 * Declared here beside the write inputs rather than as its own entity file, because it is not an
 * entity: it has no id, no identity, and is never re-read. It is the RECEIPT one write hands back,
 * so it belongs to the write contract.
 *
 * Every field is a count, not a list of ids. If a screen needs to know WHICH options changed, it has
 * to re-read the field's options -- these numbers exist so an admin can be told what happened, and
 * `deactivated > 0` in particular is the one an admin must see, since those are options a tenant was
 * offering a moment ago.
 */
export interface OptionSetBindingOutcome {
  inserted: number;
  updated: number;
  deactivated: number;
  untouched: number;
  preservedLocalOptions: number;
}

export interface IOptionSetRepository {
  /** Every set visible to the caller, in the server's order (`labelEn`, then `stableKey`). */
  getAll(): Promise<OptionSet[]>;
  /**
   * One set with its version chain, newest version number first. The versions come back as SUMMARY
   * rows -- `OptionSetVersion.hasLoadedItems` is false on each -- so a draft editor must fetch the
   * one version it is editing via `getVersion`.
   */
  getById(id: string): Promise<OptionSetDetail>;
  /** One version with its items loaded. The only call that produces a version you may save from. */
  getVersion(versionId: string): Promise<OptionSetVersion>;
  /** Returns the new set's encrypted id. The set has no versions yet. */
  create(data: CreateOptionSetInput): Promise<string>;
  update(id: string, data: UpdateOptionSetInput): Promise<void>;
  /** Soft delete. Refused with 409 while any field in any tenant is still bound to this set. */
  delete(id: string): Promise<void>;
  /** Returns the new version's encrypted id. Always lands as Draft. */
  createVersion(optionSetId: string, items: OptionSetItemInput[]): Promise<string>;
  /** Full replace of a DRAFT's items. See points 2 and 3 of this file's header. */
  updateVersion(versionId: string, items: OptionSetItemInput[]): Promise<void>;
  /** Draft -> Published, demoting the incumbent. Moves no bound field. */
  publishVersion(versionId: string): Promise<void>;
  /** First-time bind of a field version to a published set version. */
  bind(fieldVersionId: string, optionSetVersionId: string): Promise<OptionSetBindingOutcome>;
  /** Move an already-bound field version. The one path that can deactivate live options. */
  rebind(fieldVersionId: string, optionSetVersionId: string): Promise<OptionSetBindingOutcome>;
  /** Clear the binding, leaving every option row untouched. */
  unbind(fieldVersionId: string): Promise<OptionSetBindingOutcome>;
}
