/**
 * Party Entity
 *
 * Domain entity representing a Party.
 */

/**
 * Safe Contact Lookup domain entity for party selection (PartyPicker, CRM, etc.)
 * Strictly contains canonical encrypted Party ID with safe name projections.
 * Sensitive fields (phone, email, DOB, minor status, tax identifiers) are omitted.
 */
export interface PartyContactLookup {
  id: string; // Canonical encrypted Party ID
  type: "Person" | "Organization";
  displayName: string;
  fullName?: string | null;
  legalName?: string | null;
}

/**
 * Party data from API
 */
export interface PartyData {
  id: string;
  type: string;
  displayName: string;
  createdAt: string;
  modifiedAt?: string;
  linkedAdminId?: string;
  linkedUserId?: string;
  fullName?: string | null;
  legalName?: string | null;
  primaryPhone?: string | null;
  primaryEmail?: string | null;
  roles?: string[];
}

/**
 * Party entity class
 */
export class Party {
  constructor(public readonly data: PartyData) {}

  get id(): string {
    return this.data.id;
  }

  get type(): string {
    return this.data.type;
  }

  get displayName(): string {
    return this.data.displayName;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }

  get linkedAdminId(): string | undefined {
    return this.data.linkedAdminId;
  }

  get linkedUserId(): string | undefined {
    return this.data.linkedUserId;
  }

  get fullName(): string | null {
    return this.data.fullName ?? null;
  }

  get legalName(): string | null {
    return this.data.legalName ?? null;
  }

  get primaryPhone(): string | null {
    return this.data.primaryPhone ?? null;
  }

  get primaryEmail(): string | null {
    return this.data.primaryEmail ?? null;
  }

  get roles(): string[] {
    return this.data.roles ?? [];
  }

  get isPerson(): boolean {
    return this.data.type?.toLowerCase() === "person";
  }

  get isOrganization(): boolean {
    return this.data.type?.toLowerCase() === "organization";
  }

  get initials(): string {
    if (!this.displayName) return "P";
    const parts = this.displayName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Creates an immutable copy of the entity with updated party data.
   *
   * @param updates - Partial properties to merge into the entity.
   * @returns A new Party instance with updated values.
   */
  copyWith(updates: Partial<PartyData>): Party {
    return new Party({ ...this.data, ...updates });
  }
}
