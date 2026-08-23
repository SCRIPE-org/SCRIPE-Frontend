/**
 * SchemaImportResult Entity
 *
 * Domain entity for the response of `POST /v1/custom-fields/schema/import` — Wave 6 row 6.5's
 * IMPORT half, counterpart to `SchemaBundle` on the export side.
 *
 * ONE ENTRY PER GROUP IN THE POSTED BUNDLE, NEVER SUMMARISED AWAY
 * -------------------------------------------------------------------
 * The whole point of this entity is that an admin can see WHICH group was skipped and WHY, not just
 * how many were. `createdCount`/`skippedCount`/`failedCount` below are getters over `groups` for a
 * one-line summary, never a replacement for rendering every row — collapsing a Skipped group's
 * reason into a count is exactly what would hide the one outcome an admin needs to act on (rename or
 * delete the colliding group, then re-import).
 *
 * WRITE-SHAPED, NOT READ-SHAPED. Unlike every other entity in this module, this one describes the
 * outcome of a MUTATION, not a stored record — there is no corresponding `toModel`/`toJson` reverse
 * direction, because nothing re-serialises an import result into a file.
 */

/** `ImportedGroupOutcome` on the wire — the C# enum's own member names. */
export type SchemaImportGroupOutcome = "Created" | "Skipped" | "Failed";

/** One `ImportedGroupResult`, in the entity's own shape. */
export interface SchemaImportGroupResultData {
  entityTypeKey: string;
  stableKey: string;
  outcome: SchemaImportGroupOutcome;
  /** Localized explanation. Null only when `outcome` is `"Created"`. */
  reason: string | null;
  /** How many of the bundle's definitions were created under this group. Zero for Skipped/Failed. */
  fieldsCreated: number;
}

/**
 * SchemaImportResult entity class.
 */
export class SchemaImportResult {
  constructor(public readonly groups: SchemaImportGroupResultData[]) {}

  get createdCount(): number {
    return this.groups.filter((g) => g.outcome === "Created").length;
  }

  get skippedCount(): number {
    return this.groups.filter((g) => g.outcome === "Skipped").length;
  }

  get failedCount(): number {
    return this.groups.filter((g) => g.outcome === "Failed").length;
  }

  /**
   * True when the posted bundle described no groups at all.
   *
   * Worth its own state: an admin who picked an empty export (every field in it ungrouped, or
   * scoped to an entity type with none) should be told the file had nothing to import, distinctly
   * from a file that DID name groups and had every one of them Skipped or Failed.
   */
  get isEmpty(): boolean {
    return this.groups.length === 0;
  }
}
