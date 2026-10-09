/**
 * IPartyRepository Interface
 *
 * Defines the contract for Party data access and composite profile orchestration.
 */
import type { Party } from "../entities/Party";
import type { PartyProfile } from "../entities/PartyProfile";

export interface PartyListParams {
  page: number;
  pageSize: number;
  search?: string;
  type?: string;
}

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
}

export interface CreateOrganizationParams {
  displayName?: string;
  legalName: string;
  taxId?: string;
  phone?: string;
  email?: string;
}

export interface AddContactPointParams {
  partyId: string;
  type: string;
  value: string;
  isPrimary?: boolean;
}

export interface AddPartyRoleParams {
  partyId: string;
  roleType: string;
  validFrom?: string;
  validTo?: string;
}

export interface AddPartyRelationshipParams {
  sourcePartyId: string;
  targetPartyId: string;
  relationshipType: string;
  validFrom?: string;
  validTo?: string;
}

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
  createOrganization(params: CreateOrganizationParams): Promise<string>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  updatePartyName(id: string, displayName: string): Promise<void>;
  delete(id: string): Promise<void>;
  addContactPoint(params: AddContactPointParams): Promise<string>;
  removeContactPoint(id: string): Promise<void>;
  addRole(params: AddPartyRoleParams): Promise<string>;
  removeRole(id: string): Promise<void>;
  addRelationship(params: AddPartyRelationshipParams): Promise<string>;
  removeRelationship(id: string): Promise<void>;
}
