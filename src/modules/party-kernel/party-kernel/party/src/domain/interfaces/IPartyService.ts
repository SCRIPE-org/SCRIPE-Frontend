/**
 * IPartyService Interface
 *
 * Defines the contract for Party API operations.
 * Implemented by PartyService in the data layer.
 */
import type { PartyModel } from "../../data/models/PartyModel";

export interface PartyListResult {
  items: PartyModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Documentation for module export
 */
export interface IPartyService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    type?: string;
    sortBy?: string;
  }): Promise<PartyListResult>;
  getById(id: string): Promise<PartyModel>;
  getProfile?(id: string): Promise<import("../../data/models/PartyModel").PartyProfileResponseJson | null>;
  create(data: Record<string, unknown>): Promise<{ id: string }>;
  createPerson?(
    data: import("../../data/models/PartyModel").CreatePersonRequestJson,
    idempotencyKey?: string
  ): Promise<{ id: string }>;
  createOrganization?(
    data: { legalName: string; displayName?: string; taxId?: string | null },
    idempotencyKey?: string
  ): Promise<{ id: string }>;
  lookupPeople?(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<import("../../data/models/PartyModel").PartyContactLookupPagedResponseJson>;
  lookupOrganizations?(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<import("../../data/models/PartyModel").PartyContactLookupPagedResponseJson>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  updatePerson?(
    id: string,
    data: {
      fullName: string;
      displayName?: string | null;
      givenName?: string | null;
      middleNames?: string | null;
      familyName?: string | null;
      dateOfBirth?: string | null;
      isMinor?: boolean | null;
      rowVersion?: string | null;
    }
  ): Promise<void>;
  updateOrganization?(
    id: string,
    data: {
      legalName: string;
      displayName?: string | null;
      taxId?: string | null;
      rowVersion?: string | null;
    }
  ): Promise<void>;
  delete(id: string): Promise<void>;
}
