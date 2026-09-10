/**
 * OptionSetVersion Entity
 *
 * One immutable-once-published snapshot of a shared option set's contents (P-4).
 *
 * WHY VERSIONS EXIST
 * ------------------
 * Binding materialises a version's items into a field's own option rows, and stored values point at
 * those rows. So the contents a field is offering can never be edited in place once anything depends
 * on them. Instead a new version is created (always Draft), edited freely, published, and fields are
 * moved to it DELIBERATELY -- publishing on its own moves nothing. That is the whole lifecycle, and
 * every predicate below is one step of it.
 *
 * ONE ENTITY SERVES TWO WIRE SHAPES, AND THE DIFFERENCE IS `items === null`
 * ------------------------------------------------------------------------
 * `OptionSetVersionSummaryResponse` (nested in the set detail) has an item COUNT and no items;
 * `OptionSetVersionResponse` (the per-version read) has the full list. Rather than two near-identical
 * entities, this one carries `items: OptionSetItem[] | null` where **null means NOT LOADED** and `[]`
 * means loaded-and-empty. The distinction is load-bearing: a draft editor that treats "not loaded" as
 * "no options" and saves would replace the version's entire contents with an empty list, which is
 * exactly the destructive edit the backend's itemless-version refusal exists to prevent. Use
 * `hasLoadedItems` before reading `items`.
 */
export type FieldVersionStatus = "Draft" | "Published" | "Deprecated" | "Archived";

import type { OptionSetItem } from "./OptionSetItem";

/**
 * A version as either read path produces it.
 */
export interface OptionSetVersionData {
  id: string;
  /**
   * The parent set's encrypted id, or null when this came from the SUMMARY shape -- which omits it,
   * because a summary is only ever read nested inside its own set's detail response, where the parent
   * is already known.
   */
  optionSetId: string | null;
  /**
   * Monotonic per set, and never reused: the next number is computed INCLUDING soft-deleted versions,
   * because version numbers get quoted to admins and two different item lists must never answer to
   * the same one.
   */
  versionNumber: number;
  status: FieldVersionStatus;
  /** ISO-8601 UTC instant, or null for a version that has never been published. */
  publishedAtUtc: string | null;
  /** null = NOT LOADED (summary shape). `[]` = loaded and genuinely empty. See the file header. */
  items: OptionSetItem[] | null;
  /**
   * How many items the version holds.
   *
   * Comes straight from the summary shape, and is derived from `items.length` when the full shape was
   * read -- so it is meaningful in both cases, which is why a screen showing counts should read this
   * rather than `items?.length ?? 0`.
   */
  itemCount: number;
}

/**
 * OptionSetVersion entity class.
 */
export class OptionSetVersion {
  constructor(public readonly data: OptionSetVersionData) {}

  copyWith(updates: Partial<OptionSetVersionData>): OptionSetVersion {
    return new OptionSetVersion({ ...this.data, ...updates });
  }

  get id(): string {
    return this.data.id;
  }

  get optionSetId(): string | null {
    return this.data.optionSetId;
  }

  get versionNumber(): number {
    return this.data.versionNumber;
  }

  get status(): FieldVersionStatus {
    return this.data.status;
  }

  get publishedAtUtc(): string | null {
    return this.data.publishedAtUtc;
  }

  get itemCount(): number {
    return this.data.itemCount;
  }

  /**
   * Whether `items` actually came back from the server, as opposed to this being a summary row.
   *
   * Guard every read of `items` with this. See the file header for what goes wrong otherwise.
   */
  get hasLoadedItems(): boolean {
    return this.data.items !== null;
  }

  /**
   * The loaded items, or an empty array for a summary row.
   *
   * Safe to render from; NOT safe to save from -- use `hasLoadedItems` first, or an unloaded version
   * saves as an empty replace.
   */
  get items(): OptionSetItem[] {
    return this.data.items ?? [];
  }

  /** Only the options a picker should offer for new records. */
  get offeredItems(): OptionSetItem[] {
    return this.items.filter((item) => item.isOffered);
  }

  /** Whether this version is a draft. */
  get isDraft(): boolean {
    return this.data.status === "Draft";
  }

  /** Whether this version is the set's currently published one. */
  get isPublished(): boolean {
    return this.data.status === "Published";
  }

  /**
   * Whether this version's ITEM LIST may be edited.
   *
   * Draft only, and the backend agrees with a 409 for anything else. Destructive editing is safe here
   * and only here, because nothing can bind to a draft -- so no field's options and no stored value
   * depend on these rows yet.
   *
   * This answers only the version's half of the question. A system-managed set refuses this path too,
   * so a screen must also consult `OptionSet.isContentEditable`.
   */
  get isEditable(): boolean {
    return this.isDraft;
  }

  /**
   * Whether this version can be published.
   *
   * Draft only -- publish is the Draft -> Published transition, and the statuses past Published are
   * forward-only. Publishing demotes whatever was Published before it and moves NO bound field: every
   * field stays pinned to the version it was bound to until an admin rebinds it, which is why
   * publishing is safe and rebinding is the operation that needs care.
   */
  get canPublish(): boolean {
    return this.isDraft;
  }

  /**
   * Whether a field version may be bound to this one.
   *
   * Published only. A Draft is documented as safe to edit destructively, so binding to one would let
   * a later draft edit silently change what already-materialised options mean; Deprecated and
   * Archived are lists something has already moved on from. The backend refuses all three with a 409
   * that names the offending status.
   */
  get isBindable(): boolean {
    return this.isPublished;
  }

  /**
   * Whether this version is retired -- superseded or fully archived.
   *
   * Grouped as one predicate because a screen treats them identically (show it, never offer it), while
   * keeping them distinct in `status` for the label: Deprecated still interprets stored values,
   * Archived is historical read only.
   */
  get isRetired(): boolean {
    return this.data.status === "Deprecated" || this.data.status === "Archived";
  }
}
