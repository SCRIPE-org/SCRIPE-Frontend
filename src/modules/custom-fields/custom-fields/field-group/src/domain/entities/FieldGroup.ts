/**
 * FieldGroup Entity
 *
 * Domain entity for a CustomFields field group (Wave 5 row 5.2) -- an ordered
 * UI grouping of field definitions belonging to ONE entity type.
 *
 * `entityTypeKey` and tenant scope are immutable after creation: the backend's
 * `UpdateFieldGroupRequest` accepts neither, so the edit form must not offer
 * them. See `IFieldGroupRepository` for the full write contract.
 */

/**
 * FieldGroup data as the read path produces it.
 *
 * Every field is present on the single response shape the API exposes
 * (`FieldGroupResponse`) -- unlike `CustomFieldData`, there is no sparse
 * "list row" variant here, so nothing on this entity can arrive undefined
 * and be blanked on a later save.
 */
export interface FieldGroupData {
  id: string;
  entityTypeKey: string;
  /**
   * Immutable machine key, unique per (entity type, tenant) — the group's portable identity
   * (Wave 6 row 6.5).
   *
   * Absent from the UPDATE shape on purpose, exactly like `entityTypeKey`: a schema re-import matches
   * on this value, so allowing a rename would silently turn an update into a create against a
   * previously exported bundle.
   */
  stableKey: string;
  labelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  /**
   * True for a platform-owned (TenantId == null) group inherited by every
   * tenant -- same convention as `CustomFieldData.isGlobal`. A tenant-scoped
   * principal can SEE a global group but cannot update, delete or reorder it:
   * the backend's ownership guard rejects those with the same "not found" it
   * uses for a genuinely missing row.
   */
  isGlobal: boolean;
}

/**
 * FieldGroup entity class.
 */
export class FieldGroup {
  constructor(public readonly data: FieldGroupData) {}

  copyWith(updates: Partial<FieldGroupData>): FieldGroup {
    return new FieldGroup({
      ...this.data,
      ...updates,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get entityTypeKey(): string {
    return this.data.entityTypeKey;
  }

  get stableKey(): string {
    return this.data.stableKey;
  }

  get labelEn(): string {
    return this.data.labelEn;
  }

  get labelAr(): string | null | undefined {
    return this.data.labelAr;
  }

  get sortOrder(): number {
    return this.data.sortOrder;
  }

  get isGlobal(): boolean {
    return this.data.isGlobal;
  }

  /**
   * The label to show for the active UI language, falling back to the English
   * label when the Arabic one was never filled in (it is optional on both the
   * create and update requests). Never returns an empty string for a group
   * that has a real English label.
   */
  displayLabel(language: string): string {
    if (language === "ar") {
      const ar = this.data.labelAr?.trim();
      if (ar) return ar;
    }
    return this.data.labelEn;
  }
}
