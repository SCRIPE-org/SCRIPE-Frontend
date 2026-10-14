/**
 * IPartyRepository Interface
 *
 * Defines the contract for Party data access and composite profile orchestration.
 */
import type { Party, PartyContactLookup } from "../entities/Party";
import type { PartyProfile } from "../entities/PartyProfile";

/**
 * Parameters for listing parties
 */
export interface PartyListParams {
  page: number;
  pageSize: number;
  search?: string;
  type?: string;
}

/**
 * Parameters for creating a person party
 */
export interface CreatePersonParams {
  fullName: string;
  displayName?: string;
  givenName?: string;
  middleNames?: string;
  familyName?: string;
  dateOfBirth?: string;
  isMinor?: boolean;
  phone?: string;
  email?: string;
  idempotencyKey?: string;
  onContactPointFailure?: (error: Error, partyId: string) => void;
}

/**
 * Parameters for creating an organization party
 */
export interface CreateOrganizationParams {
  displayName?: string;
  legalName: string;
  taxId?: string;
  phone?: string;
  email?: string;
  idempotencyKey?: string;
  onContactPointFailure?: (error: Error, partyId: string) => void;
}

/**
 * Parameters for adding a contact point to a party
 */
export interface AddContactPointParams {
  partyId: string;
  type: string;
  value: string;
  isPrimary?: boolean;
  idempotencyKey?: string;
}

/**
 * Parameters for adding a role to a party
 */
export interface AddPartyRoleParams {
  partyId: string;
  roleType: string;
  validFrom?: string;
  validTo?: string;
}

/**
 * Parameters for adding a relationship between parties
 */
export interface AddPartyRelationshipParams {
  sourcePartyId: string;
  targetPartyId: string;
  relationshipType: string;
  validFrom?: string;
  validTo?: string;
}

/**
 * Contract for Party repository operations
 */
export interface IPartyRepository {
  getAll(params: PartyListParams): Promise<{
    items: Party[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;
  getById(id: string): Promise<Party>;
  getProfile(id: string): Promise<PartyProfile>;
  create(data: Record<string, unknown>): Promise<string>;
  createPerson(params: CreatePersonParams, idempotencyKey?: string): Promise<string>;
  createOrganization(params: CreateOrganizationParams, idempotencyKey?: string): Promise<string>;
  lookupPeople(params: { page?: number; pageSize?: number; search?: string }): Promise<{
    items: PartyContactLookup[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
  lookupOrganizations(params: { page?: number; pageSize?: number; search?: string }): Promise<{
    items: PartyContactLookup[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
  lookupContacts(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: "all" | "Person" | "Organization";
  }): Promise<{
    items: PartyContactLookup[];
    totalCount: number;
  }>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  updatePartyName(
    id: string,
    displayName: string,
    options?: { type?: string; fullName?: string; rowVersion?: string | null }
  ): Promise<void>;
  updatePerson(
    id: string,
    data: {
      fullName: string;
      displayName?: string | null;
      givenName?: string | null;
      middleNames?: string | null;
      familyName?: string | null;
      rowVersion?: string | null;
    }
  ): Promise<void>;
  delete(id: string): Promise<void>;
  addContactPoint(params: AddContactPointParams): Promise<string>;
  updateContactPoint(
    id: string,
    params: {
      partyId: string;
      type: string;
      value: string;
      isPrimary?: boolean;
    }
  ): Promise<void>;
  removeContactPoint(id: string): Promise<void>;
  addRole(params: AddPartyRoleParams): Promise<string>;
  removeRole(id: string): Promise<void>;
  addRelationship(params: AddPartyRelationshipParams): Promise<string>;
  removeRelationship(id: string): Promise<void>;
}
