/**
 * OptionSetItem Entity
 *
 * One option inside one version of a shared option set (P-4) -- a key, its labels, and how it is
 * presented.
 *
 * AN ITEM IS A TEMPLATE, NOT THE THING A RECORD POINTS AT
 * ------------------------------------------------------
 * Binding a field version to a set version MATERIALISES each item into that field version's own
 * `FieldOption` row, and it is the option row -- not this item -- that stored values reference. The
 * item's id is recorded on the copy as its provenance, which is how a later rebind recognises a
 * renamed or reordered item and updates the row in place instead of duplicating it. So: an item id
 * is never a value id, and editing an item never edits a stored value.
 *
 * The predicates below live here rather than in the view because they are all statements about the
 * option lifecycle, and getting one wrong is a data-integrity bug rather than a layout bug.
 */
import type { FieldOptionStatus, OptionSetItemWritableStatus } from "../../data/models/OptionSetModel";

/**
 * An item as the read path produces it.
 *
 * Every property is present on `OptionSetItemResponse`, so nothing here can arrive undefined and be
 * blanked on a later save -- but note that a save is a FULL REPLACE of the version's item list, so a
 * screen that drops an item from its working copy deletes it from the version.
 */
export interface OptionSetItemData {
  /** The item's own encrypted id -- see this file's header on why it is not an option-row id. */
  id: string;
  /**
   * Machine key, unique within the version. Compared CASE-INSENSITIVELY everywhere it matters: the
   * backend's item validator refuses a list holding both `u18` and `U18`, and the bind collision
   * check uses the same comparison against a field's hand-authored options.
   */
  key: string;
  labelEn: string;
  labelAr: string | null;
  /** Free-form colour token. The backend stores it as an opaque string and validates only length. */
  color: string | null;
  /** Free-form icon key, resolved by the client. */
  iconKey: string | null;
  sortOrder: number;
  status: FieldOptionStatus;
}

/**
 * OptionSetItem entity class.
 */
export class OptionSetItem {
  constructor(public readonly data: OptionSetItemData) {}

  get id(): string {
    return this.data.id;
  }

  get key(): string {
    return this.data.key;
  }

  get labelEn(): string {
    return this.data.labelEn;
  }

  get labelAr(): string | null {
    return this.data.labelAr;
  }

  get color(): string | null {
    return this.data.color;
  }

  get iconKey(): string | null {
    return this.data.iconKey;
  }

  get sortOrder(): number {
    return this.data.sortOrder;
  }

  get status(): FieldOptionStatus {
    return this.data.status;
  }

  /**
   * Whether this option is offered for NEW records.
   *
   * Only `Active` is. Deliberately not written as `!== "Deactivated"`: that phrasing would also
   * treat a `Deleted` item as offerable, and this is exactly the test a picker uses to decide what
   * to render.
   */
  get isOffered(): boolean {
    return this.data.status === "Active";
  }

  /**
   * Whether this option has been withdrawn but is still meaningful.
   *
   * A withdrawn option must keep rendering on records that already hold it -- that is the entire
   * difference between deactivating and deleting -- so a list screen shows these greyed rather than
   * hiding them.
   */
  get isWithdrawn(): boolean {
    return this.data.status === "Deactivated";
  }

  /**
   * The status this item may be SENT BACK as.
   *
   * Draft editing is a full replace, so every item a screen keeps is re-submitted, `status` included.
   * A `Deleted` item cannot be re-submitted as-is: sending `Deleted` asks the backend to soft-delete
   * an option row while stored values may still reference it, and that requires a per-value
   * remap-or-blank decision no UI is entitled to take on the admin's behalf.
   *
   * So the round trip degrades `Deleted` to `Deactivated` -- the withdrawal that IS expressible, and
   * the state a deleted option was already past. Nothing is silently resurrected: a deactivated item
   * is still absent from every picker.
   */
  get writableStatus(): OptionSetItemWritableStatus {
    return this.data.status === "Deleted" ? "Deactivated" : this.data.status;
  }

  /**
   * The label to show for the active UI language, falling back to English when the Arabic label was
   * never filled in (it is optional on the request). Never returns an empty string for an item that
   * has a real English label.
   */
  displayLabel(language: string): string {
    if (language === "ar") {
      const ar = this.data.labelAr?.trim();
      if (ar) return ar;
    }
    return this.data.labelEn;
  }
}
