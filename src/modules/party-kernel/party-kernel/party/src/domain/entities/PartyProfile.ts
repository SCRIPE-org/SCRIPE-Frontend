/**
 * Party Profile Composite Entity
 *
 * Represents the comprehensive profile of a Party (Person or Organization),
 * aggregating contact methods, business roles, relationships, and subtype specifics.
 */
import { Party } from "./Party";
import type { PartyPerson } from "../../../../party-person/src/domain/entities/PartyPerson";
import type { PartyOrganization } from "../../../../party-organization/src/domain/entities/PartyOrganization";
import type { ContactPoint } from "../../../../contact-point/src/domain/entities/ContactPoint";
import type { PartyRole } from "../../../../party-role/src/domain/entities/PartyRole";
import type { PartyRelationship } from "../../../../party-relationship/src/domain/entities/PartyRelationship";
import type { MergeCandidate } from "../../../../merge-candidate/src/domain/entities/MergeCandidate";

/**
 * Underlying composite data for a PartyProfile
 */
export interface PartyProfileData {
  party: Party;
  person?: PartyPerson | null;
  organization?: PartyOrganization | null;
  contactPoints: ContactPoint[];
  roles: PartyRole[];
  relationships: PartyRelationship[];
  mergeCandidates: MergeCandidate[];
  canonicalProfile?: {
    fullName?: string | null;
    legalName?: string | null;
    rowVersion?: string | null;
    createdAt?: string | null;
    modifiedAt?: string | null;
  } | null;
}

/**
 * Composite domain entity representing the complete 360-degree party profile
 */
export class PartyProfile {
  constructor(public readonly data: PartyProfileData) {}

  get party(): Party {
    return this.data.party;
  }

  get rowVersion(): string | null {
    return this.data.canonicalProfile?.rowVersion ?? null;
  }

  get id(): string {
    return this.data.party.id;
  }

  get type(): string {
    return this.data.party.type;
  }

  get displayName(): string {
    return this.data.party.displayName;
  }

  get isPerson(): boolean {
    return this.data.party.isPerson;
  }

  get isOrganization(): boolean {
    return this.data.party.isOrganization;
  }

  get initials(): string {
    return this.data.party.initials;
  }

  get createdAt(): string {
    return (
      this.data.party.createdAt ||
      this.data.canonicalProfile?.createdAt ||
      this.data.person?.createdAt ||
      this.data.organization?.createdAt ||
      ""
    );
  }

  get modifiedAt(): string | undefined {
    return (
      this.data.party.modifiedAt ||
      this.data.canonicalProfile?.modifiedAt ||
      this.data.person?.modifiedAt ||
      this.data.organization?.modifiedAt ||
      undefined
    );
  }

  get person(): PartyPerson | null | undefined {
    return this.data.person;
  }

  get organization(): PartyOrganization | null | undefined {
    return this.data.organization;
  }

  get contactPoints(): ContactPoint[] {
    return this.data.contactPoints;
  }

  get roles(): PartyRole[] {
    return this.data.roles;
  }

  get relationships(): PartyRelationship[] {
    return this.data.relationships;
  }

  get mergeCandidates(): MergeCandidate[] {
    return this.data.mergeCandidates;
  }

  get primaryPhone(): string | null {
    const phone = this.data.contactPoints.find(
      (c) =>
        (c.type?.toLowerCase().includes("phone") || c.type?.toLowerCase().includes("mobile")) &&
        c.isPrimary
    );
    if (phone) return phone.value;
    const fallback = this.data.contactPoints.find(
      (c) => c.type?.toLowerCase().includes("phone") || c.type?.toLowerCase().includes("mobile")
    );
    return fallback ? fallback.value : null;
  }

  get primaryEmail(): string | null {
    const email = this.data.contactPoints.find(
      (c) => c.type?.toLowerCase().includes("email") && c.isPrimary
    );
    if (email) return email.value;
    const fallback = this.data.contactPoints.find((c) =>
      c.type?.toLowerCase().includes("email")
    );
    return fallback ? fallback.value : null;
  }

  get legalName(): string | null {
    return this.data.organization?.legalName || this.data.canonicalProfile?.legalName || null;
  }

  get taxId(): string | null {
    return this.data.organization?.taxId || null;
  }

  get fullName(): string {
    if (this.data.person) {
      if (this.data.person.fullName && this.data.person.fullName.trim().length > 0) {
        return this.data.person.fullName.trim();
      }
      const parts = [this.data.person.firstName, this.data.person.lastName].filter(Boolean);
      if (parts.length > 0) return parts.join(" ");
    }
    if (this.data.canonicalProfile?.fullName && this.data.canonicalProfile.fullName.trim().length > 0) {
      return this.data.canonicalProfile.fullName.trim();
    }
    return this.data.party.displayName;
  }

  copyWith(updates: Partial<PartyProfileData>): PartyProfile {
    return new PartyProfile({ ...this.data, ...updates });
  }
}
